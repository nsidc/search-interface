import _ from "underscore";
import $ from "jquery";

import { Image } from "ol/layer";
import ImageWMS from "ol/source/ImageWMS";
import Map from "ol/Map";
import View from "ol/View";

import mediator_mixin from "./mediator_mixin";
import * as mapConstants from "./spatial_selection_map/constants";

/** A visual map that provides multiple projections & spatial selection. */
class SearchMap {
  /**
   * Creates a visual Map using the given spatial reference id.
   *
   * @param {*} options Info about the element that will contain this map; must specify:
   *                    mapContainerId or mapContainerEl
   *
   * @param {*} srid The initial projection to show
   */
  constructor(options, srid) {
    this.options = options;

    this.srid = srid;
    this.defaultSrid = srid;
    this.north = this.south = this.east = this.west = null;
    this.polygonString = null;
    this.layers = {};
    this.controls = {};

    // Find the containing element and add the div in which the map will be rendered
    let mapContainer = $(
      options.mapContainerEl || "#" + options.mapContainerId
    );
    this.mapContainerId = mapContainer.attr("id");
    this.mapDivId = mapContainer.attr("id") + "_mapDiv";
    let mapDiv = $("<div>").attr("id", this.mapDivId);
    mapContainer.append(mapDiv);

    // Create the OpenLayers map with a WMS layer and zoom bar control
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
    let mapWidth = this.options.scaleMultiplier
      ? this.options.scaleMultiplier * mapConstants.MAP_SETTINGS[srid].width
      : mapConstants.MAP_SETTINGS[srid].width;
    let mapHeight = this.options.scaleMultiplier
      ? this.options.scaleMultiplier * mapConstants.MAP_SETTINGS[srid].height
      : mapConstants.MAP_SETTINGS[srid].height;
    // let mapMaxResolution = (mapConstants.MAP_SETTINGS[srid].resolutionBase / mapWidth).toFixed(4);

    // update the OpenLayers map options
    this.layers.mapWmsLayer = blueMarbleLayer();

    let mapOptions = {
      layers: [this.layers.mapWmsLayer],
      target: this.mapDivId,
      // restrictedExtent: mapConstants.MAP_SETTINGS[srid].extent,
      // projection: mapConstants.SRID_PROJECTION[srid],
      // maxExtent: mapConstants.MAP_SETTINGS[srid].extent,
      // maxResolution: mapMaxResolution,
      // tileSize: toSize([mapWidth, mapHeight]),
      // size: toSize([mapWidth, mapHeight]),
      // numZoomLevels: mapConstants.MAP_SETTINGS[srid].numZoomLevels,
      // controls: [], // Disable default controls
      view: new View({
        center: [0, 0],
        extent: [-180.0, -90.0, 180.0, 90.0],
        projection: "EPSG:4326",
        zoom: 1,
      }),
    };

    this.map = new Map(mapOptions);

    this.resizeMapContainer(this.srid, mapWidth, mapHeight);
    // TODO: Needed?
    this.map.updateSize();
    this.map.render();
    // TODO
    // this.map.zoomToMaxExtent();
    if (this.srid !== mapConstants.PROJECTION_NAMES.GLOBAL) {
      this.map.zoomIn();
    }
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
      "margin-top": mapConstants.MAP_SETTINGS[srid].marginTop,
      "margin-left": mapConstants.MAP_SETTINGS[srid].marginLeft,
      "margin-bottom": mapConstants.MAP_SETTINGS[srid].marginBottom,
    });

    $("#" + this.mapDivId).css({
      width: mapWidth,
      height: mapHeight,
    });

    // TODO: [SR 6/7/13] Does this actually need to happen?
    this.mediatorTrigger("map:changeSize", {
      "min-height": mapConstants.MAP_SETTINGS[srid].minHeight,
    });
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
      url: "https://nsidc.org/api/ogc/nsidc_ogc_global",
      params: { LAYERS: "blue_marble_07" },
      ratio: 1,
      serverType: "geoserver",
    }),
  });
}

Object.assign(SearchMap.prototype, mediator_mixin);
// SearchMap.prototype = _.extend(SearchMap.prototype, mediator_mixin);

export default SearchMap;
