/* jshint maxcomplexity: 21 */

define(['lib/mediator_mixin',
        'lib/spatial_selection_map/OpenLayersClickControl',
        'lib/spatial_selection_map/OpenLayersCustomToolbar',
        'lib/spatial_selection_map/SpatialWmsLayer',
        'lib/spatial_selection_map/SpatialSelectionLayer',
        'lib/spatial_selection_map/SpatialSelectionTransformControl',
        'lib/spatial_selection_map/SpatialSelectionUtilities',
        'lib/utility_functions'],
       function (mediatorMixin,
                 ClickControl,
                 OpenLayersCustomToolbar,
                 SpatialWmsLayer,
                 SpatialSelectionLayer,
                 SpatialSelectionTransformControl,
                 SpatialSelectionUtilities,
                 UtilityFunctions) {

  // Constructor for the OpenLayerMap class.
  // options = info about the element that will contain this map, must specify:
  //  mapContainerId or mapContainerEl
  // srid = the initial projection to show
  var OpenLayerMap = function (options, srid) {
    var mapContainer = $(options.mapContainerEl || ('#' + options.mapContainerId)),
        mapDiv;

    this.options = options;
    this.srid = srid;
    this.defaultSrid = srid;

    this.north = this.south = this.east = this.west = null;
    this.polygonString = null;
    this.layers = {};
    this.controls = {};

    this.mapContainerId = mapContainer.attr('id');
    this.mapDivId = mapContainer.attr('id') + '_mapDiv';

    // build the DOM
    mapDiv = $('<div>').attr('id', this.mapDivId);
    mapContainer.append(mapDiv);

    // Create the OpenLayers map with a WMS layer and zoom bar control
    this.createOrUpdateOpenLayersMap(this.srid);
    this.addMapClickControl();

    // Create and add the map layer for drawing and modifying a spatial selection
    this.addSpatialSelectionLayer();
    this.addTransformControl();
    this.addToolbar();
    this.addMousePositionControl();

    this.bindEvents();
  };

  OpenLayerMap.prototype.bindEvents = function () {
    this.mediatorBind('map:selectionMade', this.toggleModify, this);
    this.mediatorBind('map:selectionDone', this.doneDrawingSelectBox, this);
    this.mediatorBind('map:changePolarCoords', this.changeLatLonCorner, this);
    this.mediatorBind('map:changeGlobalCoords', this.changeLatLonBoundary, this);
    this.mediatorBind('map:clearSelection', this.clearSpatialSelection, this);
    this.mediatorBind('map:click', this.clickHandler, this);
    this.mediatorBind('map:reset', this.resetMap, this);
  };

  OpenLayerMap.prototype.addWmsLayerForMapProjection = function (srid) {
    var wrap;

    // Remove old wms layer and zoom control that need to be recreated.
    if (this.layers.mapWmsLayer !== undefined) {
      // remove the old layer
      this.map.removeLayer(this.layers.mapWmsLayer, false);
    }

    if (srid === '4326') {
      wrap = true;
    } else {
      wrap = false;
    }

    this.layers.mapWmsLayer = new SpatialWmsLayer(
      SpatialSelectionUtilities.WMS_LAYER_NAME,
      SpatialSelectionUtilities.MAP_SERVER + SpatialSelectionUtilities.MAP_SETTINGS[srid].mapConfig,
      {
        layers: SpatialSelectionUtilities.MAP_SETTINGS[srid].layer
      },
      {
        wrapDateLine: wrap
      }
    );

    // Add the new WMS layer, MUST be done prior to resetting the map options
    this.map.addLayers([this.layers.mapWmsLayer]);
  };

  OpenLayerMap.prototype.addSpatialSelectionLayer = function () {
    // Create the style and the layer for bounding box selection
    this.layers.selectionLayer = new SpatialSelectionLayer('Box Drawing Layer', {
      styleMap: new OpenLayers.StyleMap({
        'transform': new OpenLayers.Style({
          cursor: '${role}',
          pointRadius: 3,
          fillColor: 'white',
          fillOpacity: 1,
          strokeColor: 'black'
        })
      })
    });
    this.map.addLayers([this.layers.selectionLayer]);
  };

  // Create a click control handler for the map object
  OpenLayerMap.prototype.addMapClickControl = function () {
    this.controls.clickControl = new ClickControl({mapObject: this.map});
    this.map.addControl(this.controls.clickControl);
  };

  OpenLayerMap.prototype.addPolarWarningIconToMap = function () {
    var markers, size, offset, icon;
    markers = new OpenLayers.Layer.Markers('Polar Coordinate');
    this.map.addLayer(markers);

    size = new OpenLayers.Size(16, 16);
    offset = new OpenLayers.Pixel(-(size.w / 2), -(size.h / 2));
    icon = new OpenLayers.Icon('images/info-sign.png', size, offset);
    this.layers.northPoleMarker = new OpenLayers.Marker(new OpenLayers.LonLat(0, 90), icon);
    this.layers.southPoleMarker = new OpenLayers.Marker(new OpenLayers.LonLat(0, -90), icon);
    markers.addMarker(this.layers.northPoleMarker);
    markers.addMarker(this.layers.southPoleMarker);
    this.hidePolarWarnings();
  };

  OpenLayerMap.prototype.hidePolarWarnings = function () {
    this.layers.northPoleMarker.display(false);
    this.layers.southPoleMarker.display(false);
    $('#bbox-error-selectionCrossesPole').hide();
  };

  OpenLayerMap.prototype.addZoomBarForMap = function () {
    if (this.controls.zoomBar !== undefined) {
      this.map.removeControl(this.controls.zoomBar);
      this.controls.zoomBar.destroy();
    }

    this.controls.zoomBar = new OpenLayers.Control.PanZoomBar({
      oomWorldIcon: false, panIcons: false, position: new OpenLayers.Pixel(4, 16)
    });

    this.map.events.register('zoomend', this, function () {
      var selectedRegionCenter, lonLatCenter = this.map.getCenter();
      if (this.layers.selectionLayer && this.layers.selectionLayer.features && this.layers.selectionLayer.features.length > 0) {
        selectedRegionCenter = this.layers.selectionLayer.features[0].geometry.getCentroid();
        lonLatCenter = new OpenLayers.LonLat(selectedRegionCenter.x, selectedRegionCenter.y);
      }

      if (this.controls.navigationControl) {
        if (this.map.getZoom() === 0) {
          this.controls.selectBoxControl.activate();
          this.controls.navigationControl.deactivate();
          $('.olControlNavigationItemInactive').addClass('disabled');
        } else {
          $('.olControlNavigationItemInactive').removeClass('disabled');
        }
      }

      this.map.panTo(lonLatCenter);
    });

    this.map.addControl(this.controls.zoomBar);
  };

  //Create the toolbar
  OpenLayerMap.prototype.addToolbar = function () {
    if (this.controls.toolbar !== undefined) {
      this.map.removeControl(this.controls.toolbar);
      this.controls.toolbar.destroy();
    }

    this.controls.toolbar = new OpenLayersCustomToolbar(this.layers.selectionLayer);
    this.controls.selectBoxControl = this.controls.toolbar.controls[0];
    this.controls.navigationControl = this.controls.toolbar.controls[1];
    this.map.addControl(this.controls.toolbar);
  };

  //Create the mouse position control
  OpenLayerMap.prototype.addMousePositionControl = function () {
    if (this.controls.mousePositionContro !== undefined) {
      this.map.removeControl(this.controls.mousePositionContro);
    }
    this.controls.mousePositionControl = new OpenLayers.Control.MousePosition({
      separator: ' | ',
      displayProjection: new OpenLayers.Projection('EPSG:4326'),
      numDigits: 2,
      emptyString: 'Mouse is not over map.',
      formatOutput: function (lonLat) {
        var formattedLat = OpenLayers.Util.getFormattedLonLat(lonLat.lat, 'lat', 'dm'),
        formattedLon = OpenLayers.Util.getFormattedLonLat(lonLat.lon, 'lon', 'dm');

        return 'Lat: ' + formattedLat + ' | Lon: ' + formattedLon;
      }
    });
    this.map.addControl(this.controls.mousePositionControl);
  };

  //Add the tranform control to the map. If there is already a transform control
  //then remove it first.
  OpenLayerMap.prototype.addTransformControl = function () {
    //We collapsed the selection box into a line somehow, fix it.
    if (this.controls.transformControl !== undefined) {
      this.map.removeControl(this.controls.transformControl);
      this.controls.transformControl.destroy();
    }
    //{irregular: true} lets the user change the selection box by dragging the selected corner without affecting the whole polygon
    this.controls.transformControl = new SpatialSelectionTransformControl(this.layers.selectionLayer, {
      renderIntent: 'transform', irregular: true
    });
    this.map.addControl(this.controls.transformControl);
  };

  OpenLayerMap.prototype.getFeatureFromPolygon = function (polygon) {
    // feature is created when a box has been drawn.  but maybe the
    // user has not yet drawn a box so if the feature is null, create
    // a new one now.
    var feature = this.controls.selectBoxControl.handler.feature;
    if (feature === null) {
      this.controls.selectBoxControl.handler.feature = new OpenLayers.Feature.Vector(polygon);
      feature = this.controls.selectBoxControl.handler.feature;
    } else {
      feature.geometry = polygon;
    }

    return feature;
  };

  // Toggle between selection creation mode and panning/selection
  // modify mode. This function will activate the currently
  // inactive mode and deactivate the active mode.
  OpenLayerMap.prototype.toggleModify = function () {
    this.controls.transformControl.setFeature(this.layers.selectionLayer.features[0]);
    if (this.controls.selectBoxControl.active) {
      this.controls.selectBoxControl.deactivate();
      this.controls.transformControl.activate();
      this.controls.clickControl.activate();
      this.controls.navigationControl.activate();
    } else {
      this.controls.clickControl.deactivate();
    }
  };

  // Refresh the map, useful to make sure the map has the correct settings
  // for the current size and position.
  OpenLayerMap.prototype.refreshMap = function () {
    if (this.map) {
      this.map.updateSize();
    }
  };

  //Check to see if our transformation box has gotten messed up and if it has
  //then fix it.
  OpenLayerMap.prototype.checkAndFixTransformBox = function () {
    var bounds, h, w;

    bounds = this.controls.transformControl.feature.geometry.getBounds();
    h = bounds.top - bounds.bottom;
    w = bounds.right - bounds.left;
    if (Math.abs(h) < 0.0000000001 || Math.abs(w) < 0.0000000001) {
      this.addTransformControl();
    }
  };

  // calculate an 'edge' value for determining a signed area
  // pt1 and pt2 are objects that have x and y fields
  OpenLayerMap.prototype.calcEdge = function (pt1, pt2) {
    return (pt1.x * pt2.y) - (pt2.x * pt1.y);
  };

  OpenLayerMap.prototype.normalizeEast = function (east) {
    var normalizedEast = east;
    if (east < -180) {
      normalizedEast = UtilityFunctions.round((360 * (UtilityFunctions.round(east / -360, 0))) + east, 2);
    }
    if (east > 180) {
      normalizedEast = UtilityFunctions.round((-360 * (UtilityFunctions.round(east / 360, 0))) + east, 2);
    }
    return normalizedEast;
  };

  OpenLayerMap.prototype.normalizeWest = function (west) {
    var normalizedWest = west;
    if (west < -180) {
      normalizedWest = UtilityFunctions.round((360 * (UtilityFunctions.round(west / -360, 0))) + west, 2);
    }
    if (west > 180) {
      normalizedWest = UtilityFunctions.round((-360 * (UtilityFunctions.round(west / 360, 0))) + west, 2);
    }
    return normalizedWest;
  };

  // determines if a set of vertices are in clockwise order or not, using a signed area to determine this
  // vertices is an array of objects; each object has an x and y field
  OpenLayerMap.prototype.isClockwise = function (vertices) {
    var clockwise = false, area = 0, i;
    // the signed area of the polygon (actually double the signed area, but we just need the sign)
    for (i = 1; i < vertices.length; i += 1) {
      // add the area of the 'edge' to the total area
      area += this.calcEdge(vertices[i - 1], vertices[i]);
    }
    // get edge for last vertex and first.  If they are the same point already, this will simply be 0
    area += this.calcEdge(vertices[vertices.length - 1], vertices[0]);

    // a negative area indicates the polygon is clockwise
    if (area < 0) {
      clockwise = true;
    }

    return clockwise;
  };

  // return the index of the upper-left most vertex in an array of vertices
  // This assumes a 'standard' orientation of the coordinates, IE, up and right are positive
  // vertices is an array of objects; each object has an x and y field
  OpenLayerMap.prototype.getUpperLeftIndex = function (vertices) {
    var minx = null, maxy = null, uli = null, i;

    for (i = 0; i < vertices.length; i += 1) {
      if (uli === null || (UtilityFunctions.round(vertices[i].x, 4) <= minx && UtilityFunctions.round(vertices[i].y, 4) >= maxy)) {
        uli = i;
        minx = UtilityFunctions.round(vertices[i].x, 4);
        maxy = UtilityFunctions.round(vertices[i].y, 4);
      }
    }

    return uli;
  };

  // return an array of vertices starting with the upper-left-most vertex and going counter-clockwise
  // vertices is an array of objects; each object has an x and y field
  OpenLayerMap.prototype.sortCounterClockwiseFromUL = function (vertices) {
    var newVertices = [],
    cw = this.isClockwise(vertices),
    i = this.getUpperLeftIndex(vertices), // start with the upper-left most point
    count = 0;

    while (count < vertices.length) {
      count += 1;
      newVertices.push(vertices[i]);
      if (cw) {
        // if clockwise, go backwards in the array, loop from beginning to end
        i -= 1;
        if (i < 0) {
          i = vertices.length - 1;
        }
      } else {
        // if counter-clockwise, go forward in the array, loop from end to beginning
        i += 1;
        if (i >= vertices.length) {
          i = 0;
        }
      }
    }

    return newVertices;
  };

  OpenLayerMap.prototype.getSortedVerticesFrom = function (geom) {
    var vertices = geom.getVertices();

    // Check that we have four points
    // OpenLayers seems to collapse bounding box points into a single point when all coords are equal
    if (vertices.length === 1) {
      vertices.push(vertices[0], vertices[0], vertices[0]);
    }
    // OpenLayers seems to discard the lower left point when N/S coords are equal
    // Create coord if lacking the lower left
    if (vertices.length < 4) {
      vertices.splice(1, 0, vertices[0]);
    }

    return this.sortCounterClockwiseFromUL(vertices);
  };

  OpenLayerMap.prototype.setCoordinates = function (vertices) {
    var point, lat, lon,
    coordNames = ['upperLeft', 'lowerLeft', 'lowerRight', 'upperRight'],
    coordinates = {};

    // Uncomment to output debug from Proj4js
    //Proj4js.reportError = function(msg) {alert(msg);}
    _.each(vertices, function (vertex, index) {

      point = _.clone(vertex);

      // Transform the points to 4326
      if (this.map.projection.proj.srsProjNumber !== SpatialSelectionUtilities.PROJECTION_NAMES.GLOBAL) {
        point.transform(SpatialSelectionUtilities.SRID_PROJECTION[this.map.projection.proj.srsProjNumber],
                        SpatialSelectionUtilities.SRID_PROJECTION[SpatialSelectionUtilities.PROJECTION_NAMES.GLOBAL]);
      }

      lat = UtilityFunctions.round(point.y, 2);
      lon = UtilityFunctions.round(point.x, 2);

      coordinates[coordNames[index] + 'Lat'] = lat;
      coordinates[coordNames[index] + 'Lon'] = lon;
    }, this);

    this.mediatorTrigger('map:changeCoordinates', coordinates);
  };

  // Clear the current spatial selection from the
  // map, text boxes and hidden polygon field.
  OpenLayerMap.prototype.clearSpatialSelection = function () {
    // Clear the selected bounds
    this.boundingBox = {};

    if (!this.controls.selectBoxControl.active && this.controls.transformControl.active) {
      this.toggleModify();
    }

    this.layers.selectionLayer.removeAllFeatures();
    this.addTransformControl();

    this.hidePolarWarnings();

    // empty the polygon element
    this.polygonString = '';
    this.destroyCrossingDateLineBox();
  };

  OpenLayerMap.prototype.getGlobalBoundingBoxSelection = function (map, geom) {
    var vertices, upperLeft, lowerRight, upperLeftPixel, lowerRightPixel, north,
        south, east, west, MAX_NORTH = 90, MIN_SOUTH = -90;

    vertices = this.getSortedVerticesFrom(geom);

    upperLeft = new OpenLayers.LonLat(vertices[0].x, vertices[0].y);
    lowerRight = new OpenLayers.LonLat(vertices[2].x, vertices[2].y);

    upperLeftPixel = map.getPixelFromLonLat(upperLeft);
    lowerRightPixel = map.getPixelFromLonLat(lowerRight);

    this.checkBoundingBoxBiggerThan(3, upperLeftPixel, lowerRightPixel);

    north = UtilityFunctions.round(upperLeft.lat, 2);
    west = this.normalizeEast(UtilityFunctions.round(upperLeft.lon, 2));
    south = UtilityFunctions.round(lowerRight.lat, 2);
    east = this.normalizeEast(UtilityFunctions.round(lowerRight.lon, 2));

    this.boundingBox = {
      north: north,
      west: west,
      south: south,
      east: east
    };

    // if the north or south coordinates are drawn off the map, automatically
    //   resize the bounding box to the border of the map
    if (north > MAX_NORTH || south < MIN_SOUTH) {
      this.mediatorTrigger(
        'map:changeGlobalCoords',
        north > MAX_NORTH ? MAX_NORTH : north, west,
        south < MIN_SOUTH ? MIN_SOUTH : south, east);
    } else {
      this.mediatorTrigger('map:changeBoundingBox', this.boundingBox);
    }
  };

  OpenLayerMap.prototype.getPolarBoundingBoxSelection = function (map, geom) {
    var vertices, upperLeft, lowerRight, upperLeftPixel, lowerRightPixel, north, south, east, west;

    // Save geometry coordinates in the global projection
    vertices = this.getSortedVerticesFrom(geom);

    if (vertices.length === 4) {
      this.setCoordinates(vertices);

      // Convert geometry to global and return the bounding box
      vertices = this.transformProjectionBox(geom, this.srid, SpatialSelectionUtilities.PROJECTION_NAMES.GLOBAL).getVertices();

      // OpenLayers collapses a bounding box into a single point when the coordinates are equal
      // Force corner points into the array to show the correct points in the inputs
      if (vertices.length === 1) {
        vertices.push(vertices[0], vertices[0], vertices[0]);
      }
      upperLeft = new OpenLayers.LonLat(vertices[0].x, vertices[0].y);
      lowerRight = new OpenLayers.LonLat(vertices[2].x, vertices[2].y);

      upperLeftPixel = map.getPixelFromLonLat(upperLeft);
      lowerRightPixel = map.getPixelFromLonLat(lowerRight);

      // TODO: The following line doesnt work in the polar projection.
      // Make this consistent with the global selection method
      // this.checkBoundingBoxBiggerThan(3, upperLeftPixel, lowerRightPixel);

      north = UtilityFunctions.round(upperLeft.lat, 2);
      west = UtilityFunctions.round(upperLeft.lon, 2);
      south = UtilityFunctions.round(lowerRight.lat, 2);
      east = UtilityFunctions.round(lowerRight.lon, 2);

      this.boundingBox = {
        north: north,
        west: west,
        south: south,
        east: east
      };
      this.mediatorTrigger('map:changeBoundingBox', this.boundingBox);
    }
  };

  // callback for when a user draws a box on the OpenLayers map.
  // returns true if the drawn feature should be rendered, false if it should be deleted.
  // geom - a representation of the polygon drawn by the user
  // mapObject - an OpenLayers map object
  // ignorePixelSize - boolean for the pixel size check of the geometry object.  If the user
  //  inputs lat/lon values from the text boxes, do not clear the geometry object even if it is
  //  less than 2 pixels wide or high.  If the user is drawing an object, keep the check in.
  OpenLayerMap.prototype.doneDrawingSelectBox = function (geom) {

    this.polygonString = geom.toString();

    if (this.srid === SpatialSelectionUtilities.PROJECTION_NAMES.GLOBAL) {
      this.destroyCrossingDateLineBox();
      this.drawCrossingDateLineBox(geom);
      this.getGlobalBoundingBoxSelection(this.map, geom);
    } else {
      this.getPolarBoundingBoxSelection(this.map, geom);
    }

    //reset defaul pixel size setting
    this.ignorePixelSize = false;

    return true;
  };

  // If the selection is less than 3 pixels wide or high, treat
  // it like a 'click' and clear the selection, but only check if the
  // user is inputing by drawing.  Let them choose the size, no matter
  // how small, when they type into the text boxes.
  OpenLayerMap.prototype.checkBoundingBoxBiggerThan = function (minPixelSize, upperLeftPixel, lowerRightPixel) {
    if (this.ignorePixelSize !== true) {
      if ((lowerRightPixel.x - upperLeftPixel.x) < minPixelSize && (lowerRightPixel.y - upperLeftPixel.y) < minPixelSize) {
        this.clearSpatialSelection();
        return false;
      }
    }
  };

  // update the style to support the layout of the new map
  OpenLayerMap.prototype.resizeMapContainer = function (srid, mapWidth, mapHeight) {
    $('#' + this.mapContainerId).css({
      'margin-top': SpatialSelectionUtilities.MAP_SETTINGS[srid].marginTop,
      'margin-left': SpatialSelectionUtilities.MAP_SETTINGS[srid].marginLeft,
      'margin-bottom': SpatialSelectionUtilities.MAP_SETTINGS[srid].marginBottom
    });

    $('#' + this.mapDivId).css({
      'width': mapWidth,
      'height': mapHeight
    });

    // TODO: [SR 6/7/13] Does this actually need to happen?
    this.mediatorTrigger('map:changeSize', {
      'min-height': SpatialSelectionUtilities.MAP_SETTINGS[srid].minHeight
    });
  };

  // Transform the geometry from the fromSrid projection to the
  // toSrid projection. This transformation will use the bounding
  // box and result in a rectangle in the toSrid projection.
  // geom - The OpenLayers.Geometry object to transform
  // fromSrid - SRID integer for the projection of the geom object
  // toSrid - SRID integer for the projection to transform into.
  OpenLayerMap.prototype.transformProjectionBox = function (geom, fromSrid, toSrid) {
    //arrays for x and y point values
    var xVals = [],
        yVals = [],
        bounds = geom.getBounds(),
        points = [],
        northPole = new OpenLayers.Geometry.Point(0, 90),
        southPole = new OpenLayers.Geometry.Point(0, -90),
        dateLine,
        crossesDateLine,
        newMinX = null, newMaxX = null, newMinY = null, newMaxY = null,
        boundsArray, minX, minY, maxX, maxY, quarterX, quarterY, i, fromEpsg, toEpsg, containsNP, containsSP,
        north, south, east, west;

    //get the current min and max X and Y values
    boundsArray = bounds.toArray();
    minX = boundsArray[0];
    minY = boundsArray[1];
    maxX = boundsArray[2];
    maxY = boundsArray[3];

    //Get the min and max corner points and then the
    //quarter, half and three quarter points between each of the
    //corner points.
    quarterX = (maxX - minX) / 4;
    xVals.push(minX);
    xVals.push(minX + quarterX);
    xVals.push(minX + 2 * quarterX);
    xVals.push(minX + 3 * quarterX);
    xVals.push(maxX);

    quarterY = (maxY - minY) / 4;
    yVals.push(minY);
    yVals.push(minY + quarterY);
    yVals.push(minY + 2 * quarterY);
    yVals.push(minY + 3 * quarterY);
    yVals.push(maxY);

    for (i = 0; i < xVals.length; i += 1) {
      points.push(new OpenLayers.Geometry.Point(xVals[i], minY));
      points.push(new OpenLayers.Geometry.Point(xVals[i], maxY));
    }

    for (i = 0; i < yVals.length; i += 1) {
      points.push(new OpenLayers.Geometry.Point(minX, yVals[i]));
      points.push(new OpenLayers.Geometry.Point(maxX, yVals[i]));
    }

    //Get the projections for transformation
    fromEpsg = SpatialSelectionUtilities.SRID_PROJECTION[fromSrid];
    toEpsg = SpatialSelectionUtilities.SRID_PROJECTION[toSrid];

    //Check to see if this geometry intersects the north or south
    //pole and add the pole to the points if it does.

    //transform the north and south poles to the projection the selection is in
    northPole = northPole.transform(SpatialSelectionUtilities.SRID_PROJECTION[SpatialSelectionUtilities.PROJECTION_NAMES.GLOBAL], fromEpsg);
    southPole = southPole.transform(SpatialSelectionUtilities.SRID_PROJECTION[SpatialSelectionUtilities.PROJECTION_NAMES.GLOBAL], fromEpsg);


    // using -90.0 for the south pole causes the line to go along 0 degrees lat instead of 180
    dateLine = new OpenLayers.Geometry.LineString([
      new OpenLayers.Geometry.Point(180.0, 90.0),
      new OpenLayers.Geometry.Point(180.0, -89.99999)
    ]);
    dateLine = dateLine.transform(SpatialSelectionUtilities.SRID_PROJECTION[SpatialSelectionUtilities.PROJECTION_NAMES.GLOBAL], fromEpsg);

    crossesDateLine = geom.intersects(dateLine);

    //Check for intersection of the pole points and the selection
    //If it does intersect then add the pole point to the points list.
    containsNP = false;
    containsSP = false;
    if (geom.intersects(northPole)) {
      containsNP = true;
      this.layers.northPoleMarker.display(true);
      $('#bbox-error-selectionCrossesPole').show();
      points.push(northPole);
    } else if (geom.intersects(southPole)) {
      containsSP = true;
      this.layers.southPoleMarker.display(true);
      $('#bbox-error-selectionCrossesPole').show();
      points.push(southPole);
    } else {
      this.hidePolarWarnings();
    }

    //Transform all of the points
    for (i = 0; i < points.length; i += 1) {
      points[i].transform(fromEpsg, toEpsg);
    }

    //If the selection contained the pole then then check to see if
    //additional points need to be added to make sure we get the correct
    //selection. This is only needed if we are going from a polar projection
    //to a global projection where the pole goes from being a point to a line.
    if (containsNP) {
      if (SpatialSelectionUtilities.POLE_VALUES[toSrid]) {
        points = points.concat(SpatialSelectionUtilities.POLE_VALUES[toSrid].north);
      }
    } else if (containsSP) {
      if (SpatialSelectionUtilities.POLE_VALUES[toSrid]) {
        points = points.concat(SpatialSelectionUtilities.POLE_VALUES[toSrid].south);
      }
    }

    //Find the new min and max x and y to generate the new
    //rectangle.
    for (i = 0; i < points.length; i += 1) {
      if (points[i] === null) {
        continue;
      }
      if (newMinX === null || points[i].x < newMinX) {
        newMinX = points[i].x;
      }
      if (newMinY === null || points[i].y < newMinY) {
        newMinY = points[i].y;
      }
      if (newMaxX === null || points[i].x > newMaxX) {
        newMaxX = points[i].x;
      }
      if (newMaxY === null || points[i].y > newMaxY) {
        newMaxY = points[i].y;
      }
    }

    north = newMaxY;
    south = newMinY;

    if (crossesDateLine) {
      east = newMinX;
      west = newMaxX;
    } else {
      west = newMinX;
      east = newMaxX;
    }

    //Create the rectangle and return it.
    return SpatialSelectionUtilities.openLayerRectangleFactory(
      new OpenLayers.Geometry.Point(west, north),
      new OpenLayers.Geometry.Point(east, north),
      new OpenLayers.Geometry.Point(east, south),
      new OpenLayers.Geometry.Point(west, south)
    );
  };

  // Get the selection polygon in the projection units of the passed projection
  // newSrid - srid of the projection to return the polygon in.
  // boundingBox - the polygon in a bounding box object representing north, south, east and west coordinates.
  OpenLayerMap.prototype.getProjectionPolygon = function (newSrid, boundingBox) {
    var upperLeftLat, upperLeftLon, lowerRightLat, lowerRightLon, upperLeftPoint, lowerRightPoint,
    upperRightY, upperRightX, upperRightPoint, lowerLeftY, lowerLeftX, lowerLeftPoint;

    if (boundingBox === undefined || boundingBox === {}) {
      return null;
    }

    upperLeftLat = boundingBox.north;
    upperLeftLon = boundingBox.west;
    lowerRightLat = boundingBox.south;
    lowerRightLon = boundingBox.east;

    //Can't do transformations if points are missing
    if (!upperLeftLat || !upperLeftLon || !lowerRightLat || !lowerRightLon) {
      return null;
    }

    // We need to create points to transform into projection coordinates for the
    // North/South Polar views.
    upperLeftPoint = new OpenLayers.Geometry.Point(upperLeftLon, upperLeftLat);
    lowerRightPoint = new OpenLayers.Geometry.Point(lowerRightLon, lowerRightLat);

    // Transform the upper left and lower right points so that we can extract the x and y values from them and
    // use those values to create the upper right and lower left points.
    if (newSrid !== SpatialSelectionUtilities.PROJECTION_NAMES.GLOBAL) {
      upperLeftPoint.transform(SpatialSelectionUtilities.SRID_PROJECTION[SpatialSelectionUtilities.PROJECTION_NAMES.GLOBAL],
        SpatialSelectionUtilities.SRID_PROJECTION[newSrid]);
      lowerRightPoint.transform(SpatialSelectionUtilities.SRID_PROJECTION[SpatialSelectionUtilities.PROJECTION_NAMES.GLOBAL],
        SpatialSelectionUtilities.SRID_PROJECTION[newSrid]);
    }

    // Now that the points have been transformed, we can get the x,y values to calculate the values for the
    // missing corners.
    upperRightY = upperLeftPoint.y;
    upperRightX = lowerRightPoint.x;
    upperRightPoint = new OpenLayers.Geometry.Point(upperRightX, upperRightY);
    lowerLeftY = lowerRightPoint.y;
    lowerLeftX = upperLeftPoint.x;
    lowerLeftPoint = new OpenLayers.Geometry.Point(lowerLeftX, lowerLeftY);

    return SpatialSelectionUtilities.openLayerRectangleFactory(upperLeftPoint, upperRightPoint, lowerRightPoint, lowerLeftPoint);
  };

  //Draw a new selection box. Will ignore pixel size.
  //newGeometry = represents the new polygon to draw
  OpenLayerMap.prototype.drawSelectBox = function (newGeometry) {
    this.ignorePixelSize = true;
    this.controls.selectBoxControl.drawFeature(newGeometry);
    this.initGeometry = newGeometry;
  };

  //Reset the map with the given projection
  OpenLayerMap.prototype.resetMap = function (srid) {
    srid = (srid !== undefined ? srid : this.defaultSrid);
    if (this.controls.transformControl.active) {
      this.toggleModify();
    }
    //Just in case the transform control has gotten messed up
    //remove and read it.
    this.addTransformControl();

    this.createOrUpdateOpenLayersMap(srid);
    this.map.zoomToMaxExtent();
    if (srid !== SpatialSelectionUtilities.PROJECTION_NAMES.GLOBAL) {
      this.map.zoomIn();
    }

    if (this.initGeometry !== undefined) {
      this.drawSelectBox(this.initGeometry);
    }
  };

  // handler for click events generated by the click control
  OpenLayerMap.prototype.clickHandler = function (e) {
    var topLeftLoc, topRightLoc, bottomRightLoc, bottomLeftLoc, clickPoly;

    //create a small pixel radius around the point so we have a buffer.
    topLeftLoc = this.map.getLonLatFromViewPortPx(e.xy.add(-3, -3));
    topRightLoc = this.map.getLonLatFromViewPortPx(e.xy.add(3, -3));
    bottomRightLoc = this.map.getLonLatFromViewPortPx(e.xy.add(3, 3));
    bottomLeftLoc = this.map.getLonLatFromViewPortPx(e.xy.add(-3, 3));

    // Construct the new Geometry polygon object with the array of points
    // we just created.
    clickPoly = SpatialSelectionUtilities.openLayerRectangleFactory(
      new OpenLayers.Geometry.Point(topLeftLoc.lon, topLeftLoc.lat),
      new OpenLayers.Geometry.Point(topRightLoc.lon, topRightLoc.lat),
      new OpenLayers.Geometry.Point(bottomRightLoc.lon, bottomRightLoc.lat),
      new OpenLayers.Geometry.Point(bottomLeftLoc.lon, bottomLeftLoc.lat)
    );

    //If the transformControl is active (we have a box to modify) and the
    //user clicked outside of the box by at least 3 pixels then clear the selection
    if (!this.controls.selectBoxControl.active &&
        this.controls.transformControl.active &&
        !this.layers.selectionLayer.features[0].geometry.intersects(clickPoly)) {
      this.toggleModify();
      this.checkAndFixTransformBox();
      this.clearSpatialSelection();
    }
  };

  // changeLatLonBoundary adjusts the selection box
  OpenLayerMap.prototype.changeLatLonBoundary = function (newNorth, newWest, newSouth, newEast) {
    //Don't try to draw a new box until they have entered all of the
    //boundaries.
    if (newNorth === '' || newWest === '' || newSouth === '' || newEast === '') {
      return;
    }

    var polygon, feature;

    polygon = SpatialSelectionUtilities.openLayerRectangleFactory(
      new OpenLayers.Geometry.Point(newWest, newNorth),
      new OpenLayers.Geometry.Point(newEast, newNorth),
      new OpenLayers.Geometry.Point(newEast, newSouth),
      new OpenLayers.Geometry.Point(newWest, newSouth)
    );

    //Modify mode does not handle feature changes well, switch out of
    //it if we are in it.
    if (this.controls.transformControl.active) {
      this.toggleModify();
    }
    feature =  this.getFeatureFromPolygon(polygon);
    //Clear the  map so that we don't draw the new selection over the old.
    this.clearSpatialSelection();

    // Draw the new selection on the map
    this.ignorePixelSize = true;
    this.controls.selectBoxControl.drawFeature(feature.geometry);
  };

  OpenLayerMap.prototype.destroyCrossingDateLineBox = function () {
    if (this.layers.crossingLayer && this.layers.crossingLayer !== undefined) {
      this.layers.crossingLayer.destroy();
    }
  };

  OpenLayerMap.prototype.drawCrossingDateLineBox = function (geom) {
    var west, east, widthLeftBox, widthRightBox, geometry,
        eastBoundary = 180, westBoundary = -180, vertices;

    geometry = geom.clone();

    // sorted order of vertices: NW, SW, SE, NE
    vertices = this.getSortedVerticesFrom(geometry);

    west = this.normalizeWest(vertices[0].x);
    east = this.normalizeEast(vertices[3].x);

    // crossing the date line means west > east
    // leave if we're not actually crossing the date line
    if (west <= east) {
      return;
    }

    widthLeftBox = Math.abs(westBoundary - east);
    widthRightBox = Math.abs(eastBoundary - west);

    if (widthLeftBox >= widthRightBox) {
      vertices[0].x = west;
      vertices[1].x = west;
      vertices[2].x = eastBoundary;
      vertices[3].x = eastBoundary;
    } else {
      vertices[0].x = westBoundary;
      vertices[1].x = westBoundary;
      vertices[2].x = east;
      vertices[3].x = east;
    }

    _(vertices).each(function (vertex) {
      vertex.calculateBounds();
    });

    geometry.components[0].components = vertices;
    geometry.components[0].calculateBounds();

    this.destroyCrossingDateLineBox();
    this.layers.crossingLayer = new SpatialSelectionLayer('Layer for Bboxes Crossing the Date Line', {
      styleMap: new OpenLayers.StyleMap({
        'transform': new OpenLayers.Style({
          cursor: '${role}',
          pointRadius: 3,
          fillColor: 'white',
          fillOpacity: 1,
          strokeColor: 'black'
        })
      })
    });
    this.map.addLayers([this.layers.crossingLayer]);
    this.controls.dateLineControl = new OpenLayers.Control.DrawFeature(this.layers.crossingLayer, OpenLayers.Handler.RegularPolygon);
    this.map.addControl(this.controls.dateLineControl);
    this.controls.dateLineControl.drawFeature(geometry);
  };


  // changeLatLonCorner is called when one of the corner points of the 4-corner box input fields changes.
  // No parameters are taken, as the entire polygon is re-read.  (Note that only upperLeft_lat/lon and
  // lowerRight_lat/lon are used in this method.)
  OpenLayerMap.prototype.changeLatLonCorner = function (upperLeftLat, upperLeftLon, lowerRightLat, lowerRightLon) {
    var polygon, feature, north, south, east, west;

    north = UtilityFunctions.round(upperLeftLat, 2);
    west = UtilityFunctions.round(upperLeftLon, 2);
    south = UtilityFunctions.round(lowerRightLat, 2);
    east = UtilityFunctions.round(lowerRightLon, 2);

    this.boundingBox = {
      north: north,
      south: south,
      east: east,
      west: west
    };

    //Get the srid we are working in so that we know whether to transform the points.
    polygon = this.getProjectionPolygon(this.srid, this.boundingBox);
    if (polygon === null) {
      return;
    }

    feature = this.getFeatureFromPolygon(polygon);

    //Clear the  map so that we don't draw the new selection over the old.
    this.clearSpatialSelection();

    // Draw the new selection on the map
    this.ignorePixelSize = true;
    this.controls.selectBoxControl.drawFeature(feature.geometry);
  };

  // Make OpenLayers render a new map to the div according to the
  // projection that the user chose from the search page radio
  // boxes or the config popup drop down list. This function also handles
  // the 'reset map' button action.
  // newSrid = srid to switch to
  OpenLayerMap.prototype.createOrUpdateOpenLayersMap = function (newSrid) {
    var mapWidth, mapHeight, mapMaxResolution, mapOptions;

    if (this.map !== undefined) {
      // Clear the spatial input boxes (Lat/Lon bounds or Corner Points), any drawn boxes
      // and the search polygon value stored in a hidden field on the page.
      this.clearSpatialSelection();
      this.controls.selectBoxControl.activate();
      this.controls.navigationControl.deactivate();

      // if no change to the srid, don't need to do anything except clear
      // any selections (already done in the previous step).
      if (this.srid === newSrid) {
        return;
      }
    }

    // Save the new srid
    this.srid = newSrid;

    mapWidth = (this.options.scaleMultiplier ?
                this.options.scaleMultiplier * SpatialSelectionUtilities.MAP_SETTINGS[newSrid].width :
                SpatialSelectionUtilities.MAP_SETTINGS[newSrid].width);
    mapHeight = (this.options.scaleMultiplier ?
                 this.options.scaleMultiplier * SpatialSelectionUtilities.MAP_SETTINGS[newSrid].height :
                 SpatialSelectionUtilities.MAP_SETTINGS[newSrid].height);
    mapMaxResolution = (SpatialSelectionUtilities.MAP_SETTINGS[newSrid].resolutionBase / mapWidth).toFixed(4);

    // update the OpenLayers map options
    mapOptions = {
      restrictedExtent: SpatialSelectionUtilities.MAP_SETTINGS[newSrid].extent,
      projection: SpatialSelectionUtilities.SRID_PROJECTION[newSrid],
      maxExtent: SpatialSelectionUtilities.MAP_SETTINGS[newSrid].extent,
      maxResolution: mapMaxResolution,
      tileSize: new OpenLayers.Size(mapWidth, mapHeight),
      numZoomLevels: SpatialSelectionUtilities.MAP_SETTINGS[newSrid].numZoomLevels,
      controls: [] // Disable default controls
    };

    if (this.map === undefined) {
      // create the OpenLayers map and save it in this object
      this.map = new OpenLayers.Map(this.mapDivId, mapOptions);
    } else {
      this.map.setOptions(mapOptions);
    }

    this.resizeMapContainer(this.srid, mapWidth, mapHeight);

    this.addWmsLayerForMapProjection(newSrid);

    this.addZoomBarForMap();

    this.addPolarWarningIconToMap();

    //If we are in modify mode switch to selection mode to prevent
    //problems with projection changes in modify mode.
    if (this.controls.transformControl !== undefined && this.controls.transformControl.active) {
      this.toggleModify();
    }

    // refreshMap calls OpenLayers updateSize
    this.refreshMap();
    this.map.render(this.mapDivId);
    this.map.zoomToMaxExtent();
    if (this.srid !== SpatialSelectionUtilities.PROJECTION_NAMES.GLOBAL) {
      this.map.zoomIn();
    }
  };



  _.extend(OpenLayerMap.prototype, mediatorMixin);

  return OpenLayerMap;
});
