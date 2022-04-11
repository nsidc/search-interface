import $ from "jquery";
import _ from "underscore";

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import Image from "ol/layer/Image";
import ImageWMS from "ol/source/ImageWMS";
import Map from "ol/Map";
import View from "ol/View";

import { BASE_LAYERS, MAP_LAYER_TITLES } from './constants';

export function openLayerRectangleFactory(
    upperLeftPoint,
    upperRightPoint,
    lowerRightPoint,
    lowerLeftPoint
) {
    var linearRingPoints = [],
        polygon;

    linearRingPoints.push(upperLeftPoint);
    linearRingPoints.push(upperRightPoint);
    linearRingPoints.push(lowerRightPoint);
    linearRingPoints.push(lowerLeftPoint);

    // Construct the new Geometry polygon object with the array of points
    // we just created.
    // polygon = new OpenLayers.Geometry.Polygon(
    //   [new OpenLayers.Geometry.LinearRing(linearRingPoints)]
    // );

    return polygon;
}


/**
 * Initialize Proj4 with the parameters for the two polar projections
 */
export function initializeProjections() {
    proj4.defs('EPSG:3413', '+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');
    proj4.defs('EPSG:3031', '+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');
    register(proj4);
}

/**
 * Creates a dictionary of OpenLayers Views, one for each
 * projection. The keys are the layer title and the View is the key's
 * value.
 */
export function createViews() {
    let views = {};
    BASE_LAYERS.forEach((b) => {
        views[b.title] = new View({
            title: b.title,
            center: b.center,
            extent: b.extent,
            projection: b.projection,
            zoom: 1,
        });
    });

    return views;
}

/**
 * Creates dictionary of OpenLayers Layers, one for each
 * projection. Each layer uses the corresponding NASA GIBS Blue Marble
 * layer as configured in BASE_LAYERS.
 */
export function createBaseLayers() {
    let layers = {};
    BASE_LAYERS.forEach((b) => {
        layers[b.title] = new Image({
            title: b.title,
            center: b.center,
            extent: b.extent,
            projection: b.projection,
            width: b.width,
            height: b.height,
            source: new ImageWMS({
                url: b.url,
                params: { 'LAYERS': b.layerName },
                ratio: b.ratio,
                hidpi: b.hidpi,
                serverType: b.serverType,
            }),
        });
    });

    return layers;
}


/**
 * Render a new map to the div according to the projection that the user has selected
 * from the search page radio boxes or the config popup dropdown list. Calling the
 * function a second time with a different projection will reset the map.
 */
export function createOpenLayersMap(mapContainerId, baseLayers, currentLayer, currentView) {
    let map = new Map({
        target: mapContainerId,
        layers: baseLayers,
        view: currentView,
    });

    resizeMapContainer(map, currentLayer.get('width'), currentLayer.get('height'));

    return map;
}

/**
 * Update the style to support the layout of the new map
 *
 * @param {*} width
 * @param {*} height
 */
export function resizeMapContainer(map, width, height) {
    $('#' + map.getTarget()).css({ width, height });
    map.updateSize();
}

/**
 *  Make the layer with the given title visible, all others
 *  invisible.
 */
export function setVisibility(layerMap, layerTitle) {
    _.values(MAP_LAYER_TITLES).forEach((t) => {
        layerMap[t].setVisible(layerMap[t].get('title') === layerTitle);
    });
}

/**
 *  From an extent (NSEW bounds), create a flat coordinate array which
 *  starts at the SW point and continues counter-clockwise, creating
 *  intermediate coordinates on each side.
 */
export function multisegmentBoxFromExtent(west, south, east, north, segments=20) {
    if (west > east) {
        east += 360.0;
    }

    let width = Math.abs(east - west),
        height = Math.abs(north - south);

    let coordinates = [];
    _.times(segments, i => coordinates.push(west + (width / segments) * i, south));
    _.times(segments, i => coordinates.push(east, south + (height / segments) * i));
    _.times(segments, i => coordinates.push(east - (width / segments) * i, north));
    _.times(segments, i => coordinates.push(west, north - (height / segments) * i));
    coordinates.push(west, south);

    return coordinates;
}
