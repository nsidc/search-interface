import $ from "jquery";

import Map from "ol/Map";
import View from "ol/View";
import Image from "ol/layer/Image";
import ImageWMS from "ol/source/ImageWMS";

import mediator_mixin from "./mediator_mixin";
import * as mapConstants from "./spatial_selection_map/constants";

/** A visual map that provides multiple projections & spatial selection. */
class SearchMap {
  /**
   * Creates a visual Map using the given spatial reference id.
   *
   * @param {*} options Info about the element that will contain this map; must specify:
   *                    mapContainerId
   *
   * @param {*} srid The initial projection to show
   */
  constructor(options, srid) {
    this.options = options;

    this.srid = srid;
    this.defaultSrid = srid;
    this.north = this.south = this.east = this.west = null;
    this.polygonString = null;
    this.controls = {};
    this.mapContainerId = options.mapContainerId;

    this.createOpenLayersMap(this.srid);
  }

  /**
   * Render a new map to the div according to the projection that the user has selected
   * from the search page radio boxes or the config popup dropdown list. Calling the
   * function a second time with a different projection will reset the map.
   *
   * @param {*} srid The projection to show
   */
  createOpenLayersMap(srid) {
    this.map = new Map({
      target: this.mapContainerId,
      // layers: [ blueMarbleLayer() ],
      view: new View({
        center: [ 0, 0],
        extent: [-180.0, -90.0, 180.0, 90.0],
        projection: "EPSG:4326",
        zoom: 1,
      }),
    });

    this.map.addLayer(blueMarbleLayer());

    this.resizeMapContainer(this.srid,
                            mapConstants.MAP_SETTINGS[srid].width,
                            mapConstants.MAP_SETTINGS[srid].height);
  }

  /**
   * Update the style to support the layout of the new map
   *
   * @param {*} srid
   * @param {*} mapWidth
   * @param {*} mapHeight
   */
  resizeMapContainer(srid, mapWidth, mapHeight) {
    $("#" + this.mapContainerId).css({
      width: mapWidth,
      height: mapHeight,
    });
    this.map.updateSize();
  }

  render() {
    this.map.updateSize();
  }
}

/**
 * Create an OpenLayers layer that displays the Blue Marble background image
 *
 * @return {ol.layer.Image} the new layer
 */
function blueMarbleLayer() {
  // TODO: Do we need to handle the 'wrap' case that creates a custom SpatialWmsLayer?
  return new Image({
    extent: [-180.0, -90.0, 180.0, 90.0],
    source: new ImageWMS({
      url: 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi',
      params: { 'LAYERS': 'BlueMarble_NextGeneration' },
      ratio: 1,
      hidpi: false,
      serverType: "geoserver",
    }),
  });
}

Object.assign(SearchMap.prototype, mediator_mixin);

export default SearchMap;
