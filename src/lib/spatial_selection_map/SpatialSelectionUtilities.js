define([], function () {

  var mapSettingsFactory = function (boundsArr, resolutionBase, maxResolution, minZoomLevels, width, height, minHeight, marginTop,
                                   marginLeft, marginBottom, layer, mapConfig, smallPanZoom) {
    return {
      //'extent': new OpenLayers.Bounds(boundsArr[0], boundsArr[1], boundsArr[2], boundsArr[3]),
      'resolutionBase': resolutionBase,
      'maxResolution': maxResolution,
      'numZoomLevels': minZoomLevels,
      'width': width,
      'height': height,
      'minHeight': minHeight,
      'marginTop': marginTop,
      'marginLeft': marginLeft,
      'marginBottom': marginBottom,
      'layer': layer,
      'mapConfig': mapConfig,
      'smallPanZoom': smallPanZoom
    };
  };

  return {

    // the URL to the NSIDC map server and tile cache server
    //dev MAP_SERVER = 'https://integration.nsidc.org/api/ogc/';
    //test MAP_SERVER = 'https://staging.nsidc.org/api/ogc/';
    //prod MAP_SERVER = 'https://nsidc.org/api/ogc/';
    MAP_SERVER : 'https://nsidc.org/api/ogc/',

    // the string used to identify the NSIDC map server WMS layer
    WMS_LAYER_NAME : 'NSIDC WMS',

    // this maps the epsg code values to the OpenLayers Projection objects
    // Initialize projections. Apparently need to do something here as well as in the
    // constructor in order to get these things to play nice. ?????
    SRID_PROJECTION : {
      // '3408': new OpenLayers.Projection('EPSG:3408'),
      // '3409': new OpenLayers.Projection('EPSG:3409'),
      // '3410': new OpenLayers.Projection('EPSG:3410'),
      // '3411': new OpenLayers.Projection('EPSG:3411'),
      // '3412': new OpenLayers.Projection('EPSG:3412'),
      // '3413': new OpenLayers.Projection('EPSG:3413'),
      // '4326': new OpenLayers.Projection('EPSG:4326')
    },

    //Global projects have the north and south pole represented by the entire top of the
    //map instead of just a single point. For these projections put an entry in this
    //Map for the leftmost and rightmost points for the top of the map to use when we
    //reproject from a single point for the pole to the whole line.
    POLE_VALUES : {
      '4326': {
        // 'north': new Array(new OpenLayers.Geometry.Point(-180, 90), new OpenLayers.Geometry.Point(180, 90)),
        // 'south': new Array(new OpenLayers.Geometry.Point(-180, -90), new OpenLayers.Geometry.Point(180, -90))
      },
      '3410': {
        // 'north': new Array(new OpenLayers.Geometry.Point(-17334193.9436869, 7356860.40173696),
        //                    new OpenLayers.Geometry.Point(17334193.9436869, 7356860.40173696)),
        // 'south': new Array(new OpenLayers.Geometry.Point(-17334193.9436869, -7356860.40173696),
        //                    new OpenLayers.Geometry.Point(17334193.9436869, -7356860.40173696))
      }
    },

    /*Map settings, each of the following needs to be set for each srid
     *extent - the max extent of the map (lowest zoom)
     *maxResolution - maximum resolution - this is the resolution at the most zoomed out level.
     *                Usually set to max extent / image width
     *tileSize - The size of tiles that OpenLayers should request,
     *           usually equal to the size of the map for smaller maps.
     *numZoomLevels - Number of zoom levels, could switch to minResolution and
     *                this value would be calculated or explicit list of resolutions
     *width - Width of the image (and containing div)
     *height - Height of the image (and containing div)
     *marginTop - top margin for the containing div.
     *marginBottom - bottom margin for the containg div.
     *layer - layer to fetch from the WMS client for this layer.
     *map - For mapserver layers the map file the layer is defined in.
     *smallPanZoom - true to display the smaller pan/zoom widget, false for the large one.
     *
     */
    MAP_SETTINGS : {
      // Cylindrical Equidistant global
      //'4326': mapSettingsFactory([-180.0000, -90.0000, 180.0000, 90.0000], 360, 0.72, // 360deg div by 500px of image width (or 180/250)
                                      //12, 500, 250, 270, 10, 10, 10, 'blue_marble_07', 'nsidc_ogc_global', false),
      // Azimuthal Equal-Area North or ease.*north in dropdown
      //'3408': mapSettingsFactory([-9010277, -9010277, 9010277, 9010277], 18020554, 54607.7394, //18020554/330,
                                      //12, 330, 330, 350, 10, 120, 10, 'blue_marble_07_circle', 'nsidc_ogc_north', false),
      // Azimuthal Equal-Area South or ease.*south in dropdown
      //'3409': mapSettingsFactory([-9010277, -9010277, 9010277, 9010277], 18020554, 54607.7394, //18020554/330,
                                      //12, 330, 330, 350, 10, 120, 10, 'blue_marble_01_circle', 'nsidc_ogc_south', false),
      // Cylindrical Equidistant global
      '4326': mapSettingsFactory([-180.0000, -90.0000, 180.0000, 90.0000], 360, 0.72, // 360deg div by 500px of image width (or 180/250)
                                      12, 650, 325, 325, 10, 10, 10, 'blue_marble_07', 'nsidc_ogc_global', false),
      // Azimuthal Equal-Area North or ease.*north in dropdown
      '3408': mapSettingsFactory([-9010277, -9010277, 9010277, 9010277], 18020554, 54607.7394, //18020554/330,
                                      12, 435, 435, 435, 10, 120, 10, 'blue_marble_07_circle', 'nsidc_ogc_north', false),
      // Azimuthal Equal-Area South or ease.*south in dropdown
      '3409': mapSettingsFactory([-9010277, -9010277, 9010277, 9010277], 18020554, 54607.7394, //18020554/330,
                                      12, 435, 435, 435, 10, 120, 10, 'blue_marble_01_circle', 'nsidc_ogc_south', false),
      // Azimuthal Equal-Area global or ease.*global in dropdown
      '3410': mapSettingsFactory([-17334193.540, -7344784.825, 17334193.540, 7344784.825], 34668387.08, 69336.7742, //34668387.08/500
                                      12, 500, 212, 350, 10, 10, 10, 'blue_marble_01', 'nsidc_ogc_global', true),
      // Polar Stereographic Ellipsoid North or polar stereo.*north in drop down
      '3411': mapSettingsFactory([-12400000, -12400000, 12400000, 12400000], 24800000, 75151.5152, // 24800000/330
                                      12, 330, 330, 350, 10, 10, 10, 'blue_marble_07_circle', 'nsidc_ogc_north', false),
      // Polar Stereographic Ellipsoid south or polar stereo.*south in dropdown
      '3412': mapSettingsFactory([-12400000, -12400000, 12400000, 12400000], 24800000, 75151.5152, // 24800000/330
                                      12, 330, 330, 350, 10, 10, 10, 'blue_marble_01_circle', 'nsidc_ogc_south', false),
      //WGS84 Polar Stereographic Ellipsoid North or polar stereo.*north in drop down
      '3413': mapSettingsFactory([-12400000, -12400000, 12400000, 12400000], 24800000, 75151.5152, // 24800000/330
                                      12, 330, 330, 350, 10, 10, 10, 'blue_marble_07_circle', 'nsidc_ogc_north', false)
    },

    PROJECTION_NAMES : {
      GLOBAL: '4326',
      EASE_GRID_NORTH: '3408',
      EASE_GRID_SOUTH: '3409'
    },

    openLayerRectangleFactory : function (upperLeftPoint, upperRightPoint, lowerRightPoint, lowerLeftPoint) {
      var linearRingPoints = [], polygon;

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

  };

});
