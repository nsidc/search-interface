import { Projection } from 'ol/proj';

function mapSettingsFactory(
  boundsArr,
  resolutionBase,
  maxResolution,
  minZoomLevels,
  width,
  height,
  minHeight,
  marginTop,
  marginLeft,
  marginBottom,
  layer,
  mapConfig,
  smallPanZoom
) {
  return {
    // 'extent': new OpenLayers.Bounds(boundsArr[0], boundsArr[1], boundsArr[2], boundsArr[3]),
    extent: boundsArr,
    resolutionBase: resolutionBase,
    maxResolution: maxResolution,
    numZoomLevels: minZoomLevels,
    width: width,
    height: height,
    minHeight: minHeight,
    marginTop: marginTop,
    marginLeft: marginLeft,
    marginBottom: marginBottom,
    layer: layer,
    mapConfig: mapConfig,
    smallPanZoom: smallPanZoom,
  };
}

// NASA GIBS:
// ----------
// Capabilities:
// https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0
// https://gibs.earthdata.nasa.gov/wms/epsg3413/best/wms.cgi?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0
// https://gibs.earthdata.nasa.gov/wms/epsg3031/best/wms.cgi?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0
//
// Layer:
// BlueMarble_NextGeneration
// Example:
// https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=BlueMarble_NextGeneration&STYLES=&FORMAT=image%2Fpng&TRANSPARENT=true&HEIGHT=256&WIDTH=256&TIME=2018-10-01&CRS=EPSG:4326&BBOX=-90,-180,90,180
//
const GIBS_BASE_URL = "https://gibs.earthdata.nasa.gov/";
export const MAP_SERVER = GIBS_BASE_URL;

// this maps the epsg code values to the OpenLayers Projection objects
// Initialize projections. Apparently need to do something here as well as in the
// constructor in order to get these things to play nice. ?????
export const SRID_PROJECTION = {
  '4326': new Projection('EPSG:4326'),
  '3413': new Projection('EPSG:3413'),
  '3031': new Projection('EPSG:3031')
};

//Global projects have the north and south pole represented by the entire top of the
//map instead of just a single point. For these projections put an entry in this
//Map for the leftmost and rightmost points for the top of the map to use when we
//reproject from a single point for the pole to the whole line.
export const POLE_VALUES = {
  4326: {
    // 'north': new Array(new OpenLayers.Geometry.Point(-180, 90), new OpenLayers.Geometry.Point(180, 90)),
    // 'south': new Array(new OpenLayers.Geometry.Point(-180, -90), new OpenLayers.Geometry.Point(180, -90))
  },
  3410: {
    // 'north': new Array(new OpenLayers.Geometry.Point(-17334193.9436869, 7356860.40173696),
    //                    new OpenLayers.Geometry.Point(17334193.9436869, 7356860.40173696)),
    // 'south': new Array(new OpenLayers.Geometry.Point(-17334193.9436869, -7356860.40173696),
    //                    new OpenLayers.Geometry.Point(17334193.9436869, -7356860.40173696))
  },
};

/*
 * Map settings, each of the following needs to be set for each srid
 *
 *   extent          the max extent of the map (lowest zoom)
 *   width           Width of the image (and containing div)
 *   height          Height of the image (and containing div)
 *   layer           layer to fetch from the WMS client for this layer.
 *   map             For mapserver layers the map file the lay x defined in.
 *
 */
export const MAP_SETTINGS = {
    4326: {
        extent: [-180.0, -90.0, 180.0, 90.0],
        width: 650,
        height: 325,
        layer: "BlueMarble_NextGeneration",
        mapConfig: "wms/epsg4326/best/wms.cgi",
    },
    3413: {
        extent: [-12400000, -12400000, 12400000, 12400000],
        width: 330,
        height: 330,
        layer: "BlueMarble_NextGeneration",
        mapConfig: "wms/epsg3413/best/wms.cgi",
    },
    3031: {
        extent: [-12400000, -12400000, 12400000, 12400000],
        width: 330,
        height: 330,
        layer: "BlueMarble_NextGeneration",
        mapConfig: "wms/epsg3031/best/wms.cgi",
    },
};

export const PROJECTION_NAMES = {
  GLOBAL: "4326",
  NORTHERN_HEMI: "3408",
  SOUTHERN_HEMI: "3409",
};
