define(['leaflet'], function (L) {
  var SpatialThumbnailView, addLayer, calculateWeight,
      bboxSettings, mapSettings;

  // settings for all the drawn bounding boxes
  bboxSettings = {
    clickable: false,
    fillOpacity: 0.3,
    color: '#ee9900' // rgb(238, 153, 0)
  };

  // settings to effectively make the map a static image
  mapSettings = {
    dragging: false,
    touchZoom: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    tap: false,
    bounceAtZoomLimits: false,
    keyboard: false,
    inertia: false,
    attributionControl: false,
    zoomControl: false,
    fadeAnimation: false,
    zoomAnimation: false
  };

  // add a layer to the given array of layers based on the given bounding box
  //
  // if the given box crosses the dateline, 2 layers are added so that the box
  // will be drawn properly
  addLayer = function (layers, box, options) {
    var north = box.north, south = box.south, east = box.east, west = box.west;

    if (east < west) {
      layers.push(L.rectangle([[south, -180], [north, east]], options));
      layers.push(L.rectangle([[south, west], [north, 180]], options));
    } else {
      layers.push(L.rectangle([[south, west], [north, east]], options));
    }

  };

  // takes a bounding box and returns how thick the border of the drawn bounding
  // box should be, or its 'weight' in terms of the leaflet API
  calculateWeight = function (box) {
    var north = box.north, south = box.south, west = box.west, east = box.east,
        height, width, weight = 2,
        smallThreshold = 10,
        smallWeight = 7,
        thinThreshold = 25;

    // for boxes crossing the dateline, adjust east to get a proper calculation
    // of the box's width
    if (east < west) {
      east += 360;
    }

    height = north - south;
    width = east - west;

    // very small bounding boxes are not immediately visible
    if ((width < smallThreshold) && (height < smallThreshold)) {
      weight = smallWeight;
    }

    // if long and skinny sometimes needs 1 to be visible (like boxes drawn with
    // east/west flip that circle the globe)
    if ((width > thinThreshold || height > thinThreshold) && (width < smallThreshold || height < smallThreshold)) {
      weight = 1;
    }

    return weight;
  };

  SpatialThumbnailView = Backbone.View.extend({

    initialize : function (options) {
      this.options = options;
    },

    render: function () {
      var layers, map, divHeight = this.options.mapPixelSize;

      if (this.options.mapProjection === '4326' || this.options.thumbnailBounds[0][0] === 0) {
        divHeight = divHeight/2;
      }

      this.$el.css({width: this.options.mapPixelSize, height: divHeight});

      // fill with a pattern to make it more obvious when the layer is global
      // 'default' just uses the fill color instead of an image
      if (this.options.mapThumbnailShading !== 'default') {
        _.extend(bboxSettings, {
          fillPattern: {
            url: this.options.mapThumbnailShading,
            pattern: {
              width: '4px',
              height: '4px',
              patternUnits: 'userSpaceOnUse'
            },
            image: {
              width: '4px',
              height: '4px'
            }
          }
        });
      }

      layers = [];

      layers.push(L.imageOverlay('/data/search/images/map/map-projection-' + this.options.mapProjection +'.png',
                                 [[-90, -180], [90, 180]]));

      _.each(this.model.get('boundingBoxes'), function (bbox) {
        addLayer(layers, bbox, _.extend({
          weight: calculateWeight(bbox)
        }, bboxSettings));
      }, this);


      // there is an issue with Leaflet and Safari where the rectangles for the
      // bounding boxes are not drawn; disabling Leaflet's 3D is a workaround for
      // this issue
      //
      // https://github.com/Leaflet/Leaflet/issues/1435
      // http://jsfiddle.net/eKwmV/40/
      L.Browser.webkit3d = false;
      L.Browser.any3d = false;

      L.CRS.CustomZoom = L.extend({}, L.CRS['EPSG' + this.options.mapProjection], {
        scale: function (zoom) {
          return this.options.mapPixelSize * Math.pow(2, zoom);
        }
      }, this);

      // create the map with the above settings, plus the created layers
      map = L.map(this.el, _.extend({
        layers: layers,
        crs: L.CRS.CustomZoom
      }, mapSettings));

      map.fitBounds(this.options.thumbnailBounds);

      // for unknown reasons, the map is not initially drawn correctly, but
      // triggering the resize event seems to fix it
      map._onResize();

      return this;
    }
  });

  return SpatialThumbnailView;
});
