import _ from 'underscore';

import 'ol/ol.css';
import Feature from 'ol/Feature';
import MousePosition from 'ol/control/MousePosition';
import Polygon from 'ol/geom/Polygon';
import MultiPolygon from 'ol/geom/MultiPolygon';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Draw, DragPan } from 'ol/interaction';
import { ZoomSlider } from 'ol/control';
import { getTransform } from 'ol/proj';
import { toStringHDMS } from 'ol/coordinate';

import ModeControl from './ModeControl';

import {
    createBaseLayers,
    createOpenLayersMap,
    createViews,
    initializeProjections,
    multisegmentBoxFromExtent,
    resizeMapContainer,
    setVisibility,
} from './spatial_selection_map/utility';

import { DEFAULT_LAYER_TITLE } from './spatial_selection_map/constants';

const round2 = (n) => Math.round(n * 100) / 100;
const WEST = -1;
const EAST = 1;
const NODIR = 0;

const Mode = {
    MapMode: 'MapMode',
    BoundingBoxMode: 'BoundingBoxMode',
};

/** A visual map that provides multiple projections & spatial selection. */
export default class SearchMap {
    // Mediator instance to send and receive application-events.
    //mediator;

    // Object whose keys map each base layer title to a corresponding
    // OpenLayers View object.
    //viewMap;

    // OpenLayers LayerGroup containing an Layer for each base layer.
    //baseLayerMap;

    // OpenLayers Map object that displays the current layer & view.
    //map;

    //  OpenLayers Layer for the extent drawn by the user.
    //extentLayer;

    // The mode we're in: panning & manipulating the map, or drawing a
    // bounding box.
    //mode;

    // If we're in bounding box mode, drawInteraction is the
    // OpenLayers Interaction object that controls it.
    //drawInteraction;

    // Built-in pan interaction
    // panInteraction;

    /**
     * Creates a visual Map using the given spatial reference id.
     *
     * @param {*} options Info about the element that will contain this map; must specify:
     *                    mapContainerId
     */
    constructor(options) {
        initializeProjections();
        this.mediator = options.mediator;

        this.viewMap = createViews();
        let currentView = this.viewMap[DEFAULT_LAYER_TITLE];

        this.baseLayerMap = createBaseLayers();
        let currentLayer = this.baseLayerMap[DEFAULT_LAYER_TITLE];
        setVisibility(this.baseLayerMap, DEFAULT_LAYER_TITLE);

        this.map = createOpenLayersMap(options.mapContainerId,
            _.values(this.baseLayerMap),
            currentLayer,
            currentView);

        this.mode = Mode.MapMode;

        this.addZoomControl();
        this.addMousePositionControl();
        this.addModeControl();
        this.addExtentDrawingInteraction();
        let pan;

        this.map.getInteractions().forEach(function (interaction) {
            if (interaction instanceof DragPan) {
                pan = interaction;
            }
        }, this);
        this.panInteraction = pan

        this.bindEvents();
    }

    /**
     *  Add a zoom slider control to the map
     */
    addZoomControl() {
        let zoomControl = new ZoomSlider();
        this.map.addControl(zoomControl);
    }

    // eslint-disable-next-line no-unused-vars
    changeCursor(evt) {
        document.body.style.cursor = (this.mode == Mode.MapMode) ? 'pointer' : 'crosshair';
    }

    /**
     *  Add a control to the map which continuously displays the
     *  geographic coordinates of the mouse.
     */
    addMousePositionControl() {
        const mousePositionControl = new MousePosition({
            coordinateFormat: (xy) => toStringHDMS(xy, 0),
            projection: 'EPSG:4326',
            placeholder: 'Mouse is not over map',
        });
        this.map.addControl(mousePositionControl);
        this.map.getViewport().addEventListener('mouseover', _.bind(this.changeCursor, this), false);
        // eslint-disable-next-line no-unused-vars
        this.map.getViewport().addEventListener('mouseout', function (evt) {
            document.body.style.cursor = 'default';
        }, false);
    }

    /**
     *
     */
    addModeControl() {
        this.ModeControl = new ModeControl(this.mediator)
        this.map.getControls().extend([this.ModeControl]);
    }

    /**
     *  Add a new Draw interaction to allow the user to draw an extent
     *  for spatial selection.
     */
    addExtentDrawingInteraction() {
        this.drawInteraction = new Draw({
            type: 'Circle',
            freehand: true,
            geometryFunction: _.bind(this.extentGeometry, this),
        });
        this.map.addInteraction(this.drawInteraction);

        this.drawInteraction.on('drawstart', _.bind(this.clearExtentLayer, this));
        this.drawInteraction.on('drawend', _.bind(this.extentDrawEnded, this));
    }

    /**
     *  A callback function provided to the OpenLayers Draw
     *  interaction. It populates the provided OpenLayers geometry
     *  object (creates one if not provided) with coordinates that
     *  accurately represent the current extent in the given
     *  projection.
     *
     *  If the current projection is the global projection, the polygon
     *  will be the four corners of the extent as derived from the west,
     *  south, east, and north bounding box values.
     *
     *  If the current projection is a polar projection, the polygon
     *  is determined by:
     *    * projecting the currently-drawn extent to lon/lat
     *      coordinates
     *    * finding the west, south, east, and north boundaries
     *    * creating a polygon with many segments on each side of the
     *      extent.
     *    * converting that polygon to the current polar projection
     *  This has the effect of rendering an arc of longitude /
     *  latitude values in a polar projection.
     */
    extentGeometry(coordinates, geometry, projection) {
        // Get projection-specific functions
        let toGlobal = getTransform(projection.getCode(), 'EPSG:4326');
        let coordinatesFn;
        if (projection.getCode() === 'EPSG:4326') {
            coordinatesFn =_.bind(this.globalCoordinatesFromExtent, this);
        } else {
            coordinatesFn = _.bind(this.polarCoordinatesFromExtent, this, projection.getCode());
        }

        // Using the two points provided in the arguments, find the
        // lon/lat boundaries defined by the points.
        let a = toGlobal(coordinates[0]),
            b = toGlobal(coordinates[1]);

        if (!geometry) {
            geometry = new Polygon([]);
            this.last_b0 = b[0];
            this.draw_dir = NODIR;
        } else {
            if (b[0] < this.last_b0) {
                // if the new drag point is more west than before
                if (this.draw_dir === NODIR) {
                    // if there was no dir set, set it to WEST
                    this.draw_dir = WEST;
                } else if (this.draw_dir === EAST) {
                    // if the draw dir was EAST, but it comes back to the origin and starts
                    // going west (and not because of crossing the dateline), change the
                    // direction to WEST
                    if (this.last_b0 > a[0] && b[0] < a[0] && !(this.last_b0 > 0.0 && b[0] < 0.0)) {
                        this.draw_dir = WEST;
                    }
                }
            } else if (b[0] > this.last_b0) {
                // if the new drag point is more east than before
                if (this.draw_dir === NODIR) {
                    // if there was no dir set, set it to EAST
                    this.draw_dir = EAST;
                } else if (this.draw_dir === WEST) {
                    // if the draw dir was WEST, but it comes back to the origin and starts
                    // going east (and not because of crossing the dateline), change the
                    // direction to EAST
                    if (this.last_b0 < a[0] && b[0] > a[0] && !(this.last_b0 < 0.0 && b[0] > 0.0)) {
                        this.draw_dir = EAST;
                    }
                }
            }

            this.last_b0 = b[0];
        }

        let a_lat = round2(a[0]);
        let b_lat = round2(b[0]);

        let west = (this.draw_dir === WEST) ? b_lat : a_lat,
            south = round2(Math.min(a[1], b[1])),
            east = (this.draw_dir === EAST) ? b_lat : a_lat,
            north = round2(Math.max(a[1], b[1]));

        geometry.setCoordinates(coordinatesFn(west, south, east, north));
        this.publishExtent(west, south, east, north);

        return geometry;
    }

    /**
     *
     */
    globalCoordinatesFromExtent(west, south, east, north) {
        return [[[west, south], [east, south], [east, north], [west, north], [west, south]]];
    }

    /**
     * Used to create multipolygon coordinates for when the map is in global view, and the bounding
     * box crosses the dateline.  Only really needed when switching from polar to global view, or
     * when manually updating text values in global view
     */
    globalCoordinatesFromExtentAroundDateline(west, south, east, north) {
        return [
            [[ [-180.0, south], [east, south], [east, north], [-180.0, north], [-180.0, south] ]],
            [[ [west, south], [180.0, south], [180.0, north], [west, north], [west, south] ]]
        ]
    }

    /**
     *
     */
    polarCoordinatesFromExtent(projection, west, south, east, north) {
        let box = multisegmentBoxFromExtent(west, south, east, north);
        let globalToPolar = getTransform('EPSG:4326', projection);
        return [_.chunk(globalToPolar(box), 2)];
    }

    /**
     *
     */
    globalGeometryFromPolarExtent(fromProjection, flatCoordinates) {
        let polarToGlobal = getTransform(fromProjection, 'EPSG:4326');
        let gc = _.chunk(polarToGlobal(flatCoordinates), 2);

        // Simplify the coordinates to just the corners
        let geometry = new Polygon([gc]);
        let e = geometry.getExtent();
        geometry.setCoordinates(this.globalCoordinatesFromExtent(e[0], e[1], e[2], e[3]));

        return geometry;
    }

    /**
     *
     */
    polarGeometryFromGlobalExtent(projection, extent) {
        return new Polygon(
            [this.polarCoordinatesFromExtent(projection, extent[0], extent[1], extent[2], extent[3])]
        );
    }

    /**
     *  Clear the extent layer & remove it from the map if it exists
     */
    clearExtentLayer() {
        if (!this.extentLayer) return;  // Guard clause

        this.map.removeLayer(this.extentLayer);
        this.extentLayer.dispose();
        this.extentLayer = null;
    }

    /**
     *  After the user has drawn an extent, create a polygonal feature
     *  to show the user's selection.
     */
    extentDrawEnded(event) {
        let geometry = event.feature.getGeometry().clone();
        this.createExtentLayer(geometry);
        this.mediator.trigger('map:extentDrawEnded');
        this.toggleMode();
    }

    /**
     *  Create the actual box "layer" for display on the map
     */
    createExtentLayer(geometry) {
        this.extentLayer = new VectorLayer({
            source: new VectorSource({ features: [
                    new Feature({geometry})
                ] }),
        });

        this.map.addLayer(this.extentLayer);
    }

    /**
     *  Trigger mediator event for the current extent so that other
     *  application components can respond.
     */
    publishExtent(west, south, east, north) {
        let extent = { west, south, east, north };
        this.mediator.trigger('map:changeBoundingBox', _.clone(extent));
    }

    /**
     *
     */
    bindEvents() {
        this.mediator.bind('map:changeCoordinates', this.changeExtent, this);
        this.mediator.bind('map:reset', this.reset, this);
        this.mediator.bind('map:switchView', this.switchView, this);
        this.mediator.bind('map:toggleMode', this.toggleMode, this);
    }

    /**
     *
     */
    changeExtent(north, west, south, east) {
        let code = this.map.getView().getProjection().getCode();
        let coordinatesFn;
        let geometry;
        if (code === 'EPSG:4326') {
            // global view
            if (west <= east) {
                // if it doesn't wrap the dateline, just use a regular box for the polygon
                geometry = new Polygon([]);
                coordinatesFn = _.bind(this.globalCoordinatesFromExtent, this);
            } else {
                // if it wraps the dateline, we need to have it draw two separate boxes, as OpenLayers
                // apparently does not automatically draw the "wrapping" on the other side of the map.
                geometry = new MultiPolygon([]);
                coordinatesFn = _.bind(this.globalCoordinatesFromExtentAroundDateline, this);
            }
        } else {
            // polar view
            geometry = new Polygon([]);
            coordinatesFn = _.bind(this.polarCoordinatesFromExtent, this, code);
        }
        geometry.setCoordinates(coordinatesFn(west, south, east, north));
        this.clearExtentLayer();
        this.createExtentLayer(geometry);
    }

    /**
     *
     */
    reset() {
        this.clearExtentLayer();
        let view = this.map.getView();
        view.setZoom(view.getMinZoom());
        this.mode = Mode.MapMode;
        this.ModeControl.resetToggle();
        this.ModeControl.handleModeToggle();
    }

    /**
     *  Changes the map to the view with the specified view title.
     */
    switchView(viewTitle) {
        let currentProjection = this.map.getView().getProjection();
        let currentLayer = this.baseLayerMap[viewTitle];
        setVisibility(this.baseLayerMap, viewTitle);

        let view = this.viewMap[viewTitle];
        this.map.setView(view);

        this.reprojectExtent(currentProjection, view.getProjection());

        resizeMapContainer(this.map, currentLayer.get('width'), currentLayer.get('height'));
        view.setZoom(view.getMinZoom());
        this.mediator.trigger('map:redrawBoundingBox');
    }

    toggleMode() {
        if (this.mode === Mode.MapMode) {
            this.mode = Mode.BoundingBoxMode;
            this.drawInteraction.setActive(true);
            this.panInteraction.setActive(false);
        } else if (this.mode == Mode.BoundingBoxMode) {
            this.mode = Mode.MapMode;
            this.drawInteraction.setActive(false);
            this.panInteraction.setActive(true);
        }
        this.changeCursor();
    }

    /**
     *
     */
    reprojectExtent(fromProjection, toProjection) {
        if (!this.extentLayer) return;

        let geometry;
        if (toProjection.getCode() === 'EPSG:4326') {
            let coords = _.clone(this.extentLayer.getSource().getFeatures()[0].getGeometry().flatCoordinates);
            geometry = this.globalGeometryFromPolarExtent(fromProjection, coords);
        } else {
            let coords = _.clone(this.extentLayer.getSource().getFeatures()[0].getGeometry().getExtent());
            geometry = this.polarGeometryFromGlobalExtent(toProjection, coords);
        }

        this.extentLayer.getSource().clear();
        this.extentLayer.getSource().addFeature(new Feature({ geometry }));
    }

    /**
     *  Sets the size of the map to trigger a rendering of this view.
     */
    render() {
        // This mode will get toggled from "Map" to "BoundingBox"
        this.mode = Mode.MapMode;
        this.ModeControl.resetToggle();
        this.ModeControl.handleModeToggle();
        this.map.updateSize();
    }
}
