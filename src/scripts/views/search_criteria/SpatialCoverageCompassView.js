define(['models/GeoBoundingBox',
       'lib/mediator_mixin',
       'lib/OpenLayerMap',
       'vendor/requirejs/text!templates/search_criteria/compass.html',
       'lib/spatial_selection_map/SpatialSelectionUtilities'],
       function (GeoBoundingBox, mediatorMixin, OpenLayerMap, compassTemplate, SpatialSelectionUtilities) {

  var template, SpatialCoverageCompassView,
      bboxErrors = GeoBoundingBox.prototype.bboxErrors,
      cornerErrors = GeoBoundingBox.prototype.cornerErrors,
      errorList = GeoBoundingBox.errors,
      isValid = GeoBoundingBox.prototype.isValid,
      isValidCornerPoints = GeoBoundingBox.prototype.isValidCornerPoints,
      defaultMapProjection,
      currentMapProjection;

  template = _.template(compassTemplate);

  SpatialCoverageCompassView = Backbone.View.extend({

    events:  {
      'click #submit-coordinates' : 'onApplyAndClosePressed',
      'click .reset-coordinates' : 'reset',
      'click #cancel-coordinates' : 'cancel',
      'keypress input' : 'onKeyPressedInInput',
      'blur .compassInput input' : 'boundingBoxUpdate',
      'blur .cornerInput input' : 'coordinatesUpdate',
      'click input#spatial_srid_north' : 'northProjectionClicked',
      'click input#spatial_srid_global' : 'globalProjectionClicked',
      'click input#spatial_srid_south' : 'southProjectionClicked'
    },

    initialize: function (options) {
      this.options = options;

      // TODO [MB 05-31-13]
      // set defaultMapProjection wihout making sure config.map is defined, probably using the factory
      // defaultMapProjection = this.options.map.view;
      defaultMapProjection = this.options.map ? this.options.map.view : 'GLOBAL';
      currentMapProjection = defaultMapProjection;

      this.hide();
      this.bindEvents();
      _.bindAll(this, 'checkExternalClick', 'mapBoundingBoxChanged', 'mapSelectionCleared', 'mapCoordinatesChanged');
    },

    bindEvents: function () {
      this.model.on('change', this.onModelChange, this);
      this.mediatorBind('search:initiated', this.onSearchInitiated, this);
      this.mediatorBind('map:clearSelection', this.mapSelectionCleared, this);
      this.mediatorBind('map:changeBoundingBox', this.mapBoundingBoxChanged, this);
      this.mediatorBind('map:changeCoordinates', this.mapCoordinatesChanged, this);
      this.mediatorBind('map:changeSize', this.mapSizeChanged, this);
      this.mediatorBind('map:click', this.clearSpatialSelection, this);
    },

    onModelChange: function () {
      if (!this.$el.hasClass('hidden')) {
        this.updateTextInputsFromModel();
        this.validateUserInputBbox();
        this.updateMapFromModel();
      }
    },

    onSearchInitiated: function () {
      this.hide();
    },

    updateMapFromModel: function () {
      if (currentMapProjection === 'GLOBAL') {
        this.boundingBoxUpdate();
      } else {
        this.coordinatesUpdate();
      }
    },

    updateTextInputsFromModel: function () {
      var coordinates,
          north = this.model.getNorth(),
          south = this.model.getSouth(),
          east = this.model.getEast(),
          west = this.model.getWest();

      coordinates = [
        parseFloat(north),
        parseFloat(south),
        parseFloat(east),
        parseFloat(west)
      ];
      _.each(coordinates, function (element, index, list) {
        list[index] = this.formatCoordinate(element);
      }, this);

      this.north(coordinates[0]);
      this.south(coordinates[1]);
      this.east(coordinates[2]);
      this.west(coordinates[3]);
    },

    initMap: function () {
      this.map = new OpenLayerMap({
        mapContainerEl: this.$el.find('#map-container')
      },  SpatialSelectionUtilities.PROJECTION_NAMES[defaultMapProjection]);
    },

    selectDefaultMapView: function () {
      var projection = this.getProjectionIdentifierByName(defaultMapProjection),
          selectMapViewElementID = '#spatial_srid_' + projection;
      $(selectMapViewElementID).click();
    },

    render: function () {
      this.$el.html(template({
        northValue: this.model.getNorth(),
        southValue: this.model.getSouth(),
        eastValue: this.model.getEast(),
        westValue: this.model.getWest(),
        polarEnabled: this.isPolarEnabled(),
        northView: this.options.features.projections.northView,
        southView: this.options.features.projections.southView,
        globalView: this.options.features.projections.globalView
      }));

      this.selectDefaultMapView();

      this.updateTextInputsFromModel();
      this.bboxErrorsInitialRender();

      this.initMap();

      $(document).mousedown(this.checkExternalClick);

      return this;
    },

    isPolarEnabled: function () {
      return this.options.features && (this.options.features.projections.northView || this.options.features.projections.southView);
    },

    formatCoordinate: function (coordinate) {
      return coordinate.toString().indexOf('.') > -1 ? coordinate.toString() : parseInt(coordinate, 10).toFixed(1);
    },

    inputVal: function (inputId, value) {
      var input = this.$el.find('#' + inputId);
      if (value) {
        input.val(this.formatCoordinate(value));
        return input;
      }
      return input.val();
    },

    north: function (value) {
      return this.inputVal('north', value);
    },

    south: function (value) {
      return this.inputVal('south', value);
    },

    east: function (value) {
      return this.inputVal('east', value);
    },

    west: function (value) {
      return this.inputVal('west', value);
    },

    lowerRightLat: function (value) {
      return this.inputVal('lowerRightLat', value);
    },

    lowerRightLon: function (value) {
      return this.inputVal('lowerRightLon', value);
    },

    upperLeftLat: function (value) {
      return this.inputVal('upperLeftLat', value);
    },

    upperLeftLon: function (value) {
      return this.inputVal('upperLeftLon', value);
    },

    checkExternalClick: function (event) {
      var $target, clickToDefineLatLonID, spatialSearchBox, spatialOptions,
          spatialTrigger, classNameExcludesSpatialTrigger;

      $target = $(event.target);
      clickToDefineLatLonID = 'compass-container';
      spatialSearchBox = 'spatial-search-box';
      spatialOptions = 'spatial-options';
      spatialTrigger = 'spatial-trigger';
      classNameExcludesSpatialTrigger = $target[0].className.indexOf && ($target[0].className.indexOf(spatialTrigger) === -1);

      if (!this.$el.hasClass('hidden') &&
          !$target.closest(this.$el).length &&
          (($target[0].id !== clickToDefineLatLonID) &&
          ($target[0].id !== spatialSearchBox) &&
          ($target[0].id !== spatialOptions) &&
          classNameExcludesSpatialTrigger)) {
        this.$el.addClass('hidden');
        this.clearSpatialSelection();
      }

    },

    onApplyAndClosePressed: function () {
      var nsew = {
        north: this.north(),
        south: this.south(),
        east: this.east(),
        west: this.west()
      };

      if (this.model.isValid(nsew)) {
        this.toggleVisibility();
        this.model.setFromNsewObject(nsew);
        this.clearSpatialSelection();
      }

    },

    onKeyPressedInInput: function (event) {
      if (event.which === 13) {  // if Enter is the pressed key
        this.onApplyAndClosePressed();
      }
    },

    bboxErrorsInitialRender: function () {
      var errorElements;

      errorElements = this.$el.find('.bbox-error');

      this.hideAllBboxErrors();

    },

    getBboxErrorElementIDs: function (errorKey) {
      var matches, directionInputID, errorType, direction, identifier;

      matches = /([a-zA-Z]*)((Out|Input|Greater).*)/.exec(errorKey);
      direction = matches[1]; // north, south, east, west
      errorType = matches[2]; // InputNotNumber, OutOfRange, GreaterThanNorth

      if (errorType === 'GreaterThanNorth') {
        identifier = 'southGreaterThanNorth';
        directionInputID = ['#north', '#south'];
      } else if (errorType === 'GreaterThanEast') {
        identifier = 'westGreaterThanEast';
        directionInputID = ['#west', '#east'];
      } else if (errorType === 'OutOfRange') {
        identifier = direction + errorType;
        directionInputID = ['#' + direction];
      } else if (errorType === 'InputNotNumber') {
        identifier = errorType;
        directionInputID = ['#' + direction];
      }

      return { inputID: directionInputID,
               errorMessageID: '#bbox-error-' + identifier };
    },

    hideBboxErrorByIDpair: function (errorIDs) {
      this.$el.find(errorIDs.errorMessageID).hide();
      this.removeHighlighting(errorIDs.inputID);
    },

    hideAllBboxErrors: function () {
      var elements;

      _.each(errorList, function (value, key) {
        elements = this.getBboxErrorElementIDs(key);
        this.hideBboxErrorByIDpair(elements);
      }, this);
    },

    showBboxError: function (errorKey) {
      var errorIDs = this.getBboxErrorElementIDs(errorKey);

      this.$el.find(errorIDs.errorMessageID).show();
      this.addHighlighting(errorIDs.inputID);
    },

    showBboxErrors: function (status) {
      this.hideAllBboxErrors();

      _.each(status, function (errorRaised, errorKey) {
        if (errorRaised) {
          this.showBboxError(errorKey);
        }
      }, this);
    },

    addHighlighting: function (elementIDs) {
      _.each(elementIDs, function (element) {
        this.$el.find(element).addClass('highlighting');
      }, this);
    },

    removeHighlighting: function (elementIDs) {
      _.each(elementIDs, function (element) {
        this.$el.find(element).removeClass('highlighting');
      }, this);
    },

    validateUserInputBbox: function () {
      var userBboxErrors,
          userBbox = {
        north: this.north(),
        south: this.south(),
        east: this.east(),
        west: this.west()
      };

      userBboxErrors = bboxErrors(userBbox);
      this.hideAllBboxErrors();

      if (!isValid(userBbox)) {
        this.showBboxErrors(userBboxErrors);
        return false;
      }

      return true;
    },

    validateUserInputCorners: function () {
      var errors,
        cornersBox = {
          upperLeftLat: this.upperLeftLat(),
          upperLeftLon: this.upperLeftLon(),
          lowerRightLat: this.lowerRightLat(),
          lowerRightLon: this.lowerRightLon()
        };

      this.hideAllBboxErrors();

      if (!isValidCornerPoints(cornersBox)) {
        errors = cornerErrors(cornersBox);
        this.showBboxErrors(errors);
        return false;
      }

      return true;
    },

    cancel: function () {
      this.hide();
      this.clearSpatialSelection();
    },

    clearSpatialSelection: function () {
      this.bboxErrorsInitialRender();
      this.clearCorners();
      this.mapSelectionCleared();
      this.clearMap(SpatialSelectionUtilities.PROJECTION_NAMES[currentMapProjection]);
    },

    reset: function () {
      this.mediatorTrigger('search:resetBoundingBox');
      this.clearSpatialSelection();
    },

    clearMap: function (projection) {
      this.mediatorTrigger('map:reset', projection);
    },

    toggleVisibility: function () {
      this.$el.toggleClass('hidden');
      this.$el.css('display', '');
    },

    hide: function () {
      this.$el.addClass('hidden');
    },

    boundingBoxUpdate: function () {
      var west = parseFloat(this.west()),
          east = parseFloat(this.east()),
          north = parseFloat(this.north()),
          south = parseFloat(this.south());

      if (this.validateUserInputBbox()) {
        if (west > east) {
          west -= 360;
        }

        this.mediatorTrigger('map:changeGlobalCoords', north, west, south, east);
      }
    },

    mapBoundingBoxChanged: function (boundingBox) {
      this.north(boundingBox.north);
      this.south(boundingBox.south);
      this.east(boundingBox.east);
      this.west(boundingBox.west);

      this.validateUserInputBbox();
    },

    coordinatesUpdate: function () {
      var upperLeftLat = parseFloat(this.upperLeftLat()),
          upperLeftLon = parseFloat(this.upperLeftLon()),
          lowerRightLat = parseFloat(this.lowerRightLat()),
          lowerRightLon = parseFloat(this.lowerRightLon());

      if (this.validateUserInputCorners()) {
        this.mediatorTrigger('map:changePolarCoords', upperLeftLat, upperLeftLon, lowerRightLat, lowerRightLon);
      }
    },

    mapCoordinatesChanged: function (cornerPoints) {
      this.lowerRightLat(cornerPoints.lowerRightLat);
      this.lowerRightLon(cornerPoints.lowerRightLon);
      this.upperLeftLat(cornerPoints.upperLeftLat);
      this.upperLeftLon(cornerPoints.upperLeftLon);

      this.validateUserInputCorners();
    },

    mapSelectionCleared: function () {
      this.north(this.model.get('northDefault'));
      this.south(this.model.get('southDefault'));
      this.east(this.model.get('eastDefault'));
      this.west(this.model.get('westDefault'));
    },

    northProjectionClicked: function () {
      currentMapProjection = 'EASE_GRID_NORTH';
      this.changeProjection(SpatialSelectionUtilities.PROJECTION_NAMES.EASE_GRID_NORTH);
    },

    globalProjectionClicked: function () {
      currentMapProjection = 'GLOBAL';
      this.changeProjection(SpatialSelectionUtilities.PROJECTION_NAMES.GLOBAL);
    },

    southProjectionClicked: function () {
      currentMapProjection = 'EASE_GRID_SOUTH';
      this.changeProjection(SpatialSelectionUtilities.PROJECTION_NAMES.EASE_GRID_SOUTH);
    },

    showCorners: function () {
      var nsewDiv = this.$el.find('#spatialInput_nsew'),
          cornersDiv = this.$el.find('#spatialInput_corners');
      cornersDiv.removeClass('hidden');
      nsewDiv.addClass('hidden');
    },

    clearCorners: function () {
      this.$el.find('#spatialInput_corners input').val('');
    },

    showNSEW: function () {
      var nsewDiv = this.$el.find('#spatialInput_nsew'),
          cornersDiv = this.$el.find('#spatialInput_corners');
      nsewDiv.removeClass('hidden');
      cornersDiv.addClass('hidden');
    },

    changeProjection: function (newProjection) {
      if (newProjection === SpatialSelectionUtilities.PROJECTION_NAMES.EASE_GRID_NORTH ||
          newProjection === SpatialSelectionUtilities.PROJECTION_NAMES.EASE_GRID_SOUTH) {
        this.clearCorners();
        this.showCorners();
      } else if (newProjection === SpatialSelectionUtilities.PROJECTION_NAMES.GLOBAL) {
        this.mapSelectionCleared();
        this.showNSEW();
      }
      this.clearMap(newProjection);
    },

    getProjectionIdentifierByName : function (projectionName) {
      if (projectionName === 'EASE_GRID_NORTH') {
        return 'north';
      } else if (projectionName === 'EASE_GRID_SOUTH') {
        return 'south';
      }
      return 'global';
    }

  });

  _.extend(SpatialCoverageCompassView.prototype, mediatorMixin);

  return SpatialCoverageCompassView;
});
