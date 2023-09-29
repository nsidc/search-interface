import _ from 'underscore';

export const MAP_LAYER_TITLES = {
    GLOBAL: 'GLOBAL',
    NORTHERN_HEMI: 'NORTH',
    SOUTHERN_HEMI: 'SOUTH',
};

export const DEFAULT_LAYER_TITLE = MAP_LAYER_TITLES.GLOBAL;

// NASA GIBS:
// ----------
// Capabilities:
// https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0
// https://gibs.earthdata.nasa.gov/wms/epsg3413/best/wms.cgi?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0
// https://gibs.earthdata.nasa.gov/wms/epsg3031/best/wms.cgi?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0
//
// Example using the 'BlueMarble_NextGeneration' layer:
// https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=BlueMarble_NextGeneration&STYLES=&FORMAT=image%2Fpng&TRANSPARENT=true&HEIGHT=256&WIDTH=256&TIME=2018-10-01&CRS=EPSG:4326&BBOX=-90,-180,90,180
//
const NASA_GIBS_URL_TEMPLATE = _.template("https://gibs.earthdata.nasa.gov/wms/epsg<%= srid %>/best/wms.cgi");

/**
 *  Configuration for the Blue Marble layers in the three projections
 *  used on the search criteria map.
 */
export const BASE_LAYERS = [{
    title: MAP_LAYER_TITLES.GLOBAL,
    projection: 'EPSG:4326',
    url: NASA_GIBS_URL_TEMPLATE({ 'srid': '4326' }),
    layerName: "BlueMarble_ShadedRelief_Bathymetry",
    center: [0, 0],
    extent: [-180.0, -90.0, 180.0, 90.0],
    width: 'auto',
    height: 330,
    ratio: 1,
    hidpi: false,
    serverType: 'geoserver',
}, {
    title: MAP_LAYER_TITLES.NORTHERN_HEMI,
    projection: 'EPSG:3413',
    url: NASA_GIBS_URL_TEMPLATE({ 'srid': '3413' }),
    layerName: "BlueMarble_ShadedRelief_Bathymetry",
    center: [0.0, 0.0],
    extent: [-4000000, -4000000, 4000000, 4000000],
    width: 500,
    height: 500,
    ratio: 1,
    hidpi: false,
    serverType: 'geoserver',
}, {
    title: MAP_LAYER_TITLES.SOUTHERN_HEMI,
    projection: 'EPSG:3031',
    url: NASA_GIBS_URL_TEMPLATE({ 'srid': '3031' }),
    layerName: "BlueMarble_ShadedRelief_Bathymetry",
    center: [0.0, 0.0],
    extent: [-4000000, -4000000, 4000000, 4000000],
    width: 500,
    height: 500,
    ratio: 1,
    hidpi: false,
    serverType: 'geoserver',
}];
