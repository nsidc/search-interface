import _ from 'underscore';

import 'ol/ol.css';
import Feature from 'ol/Feature';
import MousePosition from 'ol/control/MousePosition';
import Polygon from 'ol/geom/Polygon';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Draw } from 'ol/interaction';
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

        this.bindEvents();
    }

    /**
     *  Add a zoom slider control to the map
     */
    addZoomControl() {
        let zoomControl = new ZoomSlider();
        this.map.addControl(zoomControl);
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
    }

    /**
     *
     */
    addModeControl() {
        this.map.getControls().extend([new ModeControl(this.mediator)]);
    }

    /**
     *  Add a new Draw interaction to allow the user to draw an extent
     *  for spatial selection.
     */
    addExtentDrawingInteraction() {
        this.drawInteraction = new Draw({
            type: 'Circle',
            geometryFunction: _.bind(this.extentGeometry, this),
        });
        this.map.addInteraction(this.drawInteraction);

        this.drawInteraction.on('drawstart', _.bind(this.clearExtentLayer, this));
        this.drawInteraction.on('drawend', _.bind(this.extentDrawEnded, this));
    }

    /**
     * Remove the drawing interaction when we've switched modes.
     */
    removeExtentDrawingInteraction() {
        this.map.removeInteraction(this.drawInteraction);
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
        if (!geometry) {
            geometry = new Polygon([]);
        }

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
        let west = round2(Math.min(a[0], b[0])),
            south = round2(Math.min(a[1], b[1])),
            east = round2(Math.max(a[0], b[0])),
            north = round2(Math.max(a[1], b[1]));

        geometry.setCoordinates([coordinatesFn(west, south, east, north)]);
        this.publishExtent(west, south, east, north);

        return geometry;
    }

    /**
     *
     */
    globalCoordinatesFromExtent(west, south, east, north) {
        return [[west, south], [east, south], [east, north], [west, north], [west, south]];
    }

    /**
     *
     */
    polarCoordinatesFromExtent(projection, west, south, east, north) {
        let box = multisegmentBoxFromExtent(west, south, east, north);
        let globalToPolar = getTransform('EPSG:4326', projection);
        return _.chunk(globalToPolar(box), 2);
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
        geometry.setCoordinates([this.globalCoordinatesFromExtent(e[0], e[1], e[2], e[3])]);

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
        console.log(geometry);
        this.extentLayer = new VectorLayer({
            source: new VectorSource({ features: [
                new Feature({geometry})
            ] }),
        });

        this.map.addLayer(this.extentLayer);
        this.mediator.trigger('map:extentDrawEnded');
        this.toggleMode();
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
        console.log('SearchMap.changeLatLonBoundary', north, west, south, east);
    }

    /**
     *
     */
    reset() {
        this.clearExtentLayer();
        let view = this.map.getView();
        view.setZoom(view.getMinZoom());
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
    }

    toggleMode() {
        if (this.mode === Mode.MapMode) {
            this.mode = Mode.BoundingBoxMode;
            this.addExtentDrawingInteraction();
        } else if (this.mode === Mode.BoundingBoxMode) {
            this.mode = Mode.MapMode;
            this.removeExtentDrawingInteraction();
        }
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
        this.map.updateSize();
    }
}
