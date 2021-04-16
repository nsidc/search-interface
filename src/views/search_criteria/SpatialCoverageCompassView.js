import Backbone from 'backbone';
import _ from 'underscore';
import $ from 'jquery';

import SearchMap from '../../lib/SearchMap';
import * as mapConstants from '../../lib/spatial_selection_map/constants';
import viewTemplate from '../../templates/search_criteria/compass.html';

// TODO: What about articles indicating Backbone & ES classes don't play well together?
class SpatialCoverageCompassView extends Backbone.View {

    get events() {
        return {
            'click #submit-coordinates': 'onApplyAndClosePressed',
            'click .reset-coordinates': 'reset',
            'click #cancel-coordinates': 'cancel',
            'keypress input': 'onKeyPressedInInput',
            'blur .compassInput input': 'boundingBoxUpdate',
            'blur .cornerInput input': 'coordinatesUpdate',
            'click input#spatial_srid_north': 'northProjectionClicked',
            'click input#spatial_srid_global': 'globalProjectionClicked',
            'click input#spatial_srid_south': 'southProjectionClicked'
        };
    }

    initialize(options) {
        this.options = options;
        this.mediator = options.mediator;

        // TODO [MB 05-31-13]
        // set defaultMapProjection without making sure config.map is defined,
        // probably using the factory
        this.defaultMapProjection = this.options.config.map ? this.options.config.map.view : 'GLOBAL';
        this.currentMapProjection = this.defaultMapProjection;

        this.hide();
        this.bindEvents(this.mediator);
        _.bindAll(this,
            'checkExternalClick',
            'mapBoundingBoxChanged',
            'mapSelectionCleared',
            'mapCoordinatesChanged');
    }

    bindEvents(mediator) {
        this.model.on('change', this.onModelChange, this);
        mediator.on('search:initiated', this.onSearchInitiated, this);
        mediator.on('map:clearSelection', this.mapSelectionCleared, this);
        mediator.on('map:changeBoundingBox', this.mapBoundingBoxChanged, this);
        mediator.on('map:changeCoordinates', this.mapCoordinatesChanged, this);
        mediator.on('map:changeSize', this.mapSizeChanged, this);
        mediator.on('map:click', this.clearSpatialSelection, this);
    }

    onModelChange() {
        if(!this.$el.hasClass('hidden')) {
            this.updateTextInputsFromModel();
            this.validateUserInputBbox();
            this.updateMapFromModel();
        }
    }

    onSearchInitiated() {
        this.hide();
    }

    updateMapFromModel() {
        if(this.currentMapProjection === 'GLOBAL') {
            this.boundingBoxUpdate();
        }
        else {
            this.coordinatesUpdate();
        }
    }

    updateTextInputsFromModel() {
        let coordinates,
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
    }

    initMap() {
        this.map = new SearchMap(
            { mapContainerEl: this.$el.find('#map-container') },
            mapConstants.PROJECTION_NAMES[this.defaultMapProjection]
        );
    }

    selectDefaultMapView() {
        var projection = this.getProjectionIdentifierByName(this.defaultMapProjection),
            selectMapViewElementID = '#spatial_srid_' + projection;
        $(selectMapViewElementID).click();
    }

    render() {
        this.$el.html(_.template(viewTemplate)({
          northValue: this.model.getNorth(),
          southValue: this.model.getSouth(),
          eastValue: this.model.getEast(),
          westValue: this.model.getWest(),
          polarEnabled: this.isPolarEnabled(),
          northView: this.options.config.projections.northView,
          southView: this.options.config.projections.southView,
          globalView: this.options.config.projections.globalView
        }));

        this.selectDefaultMapView();

        this.updateTextInputsFromModel();
        this.bboxErrorsInitialRender();

        this.initMap();

        $(document).mousedown(this.checkExternalClick);

        return this;
    }

    isPolarEnabled() {
        return this.options.config &&
            (this.options.config.projections.northView || this.options.config.projections.southView);
    }

    formatCoordinate(coordinate) {
        return coordinate.toString().indexOf('.') > -1 ?
            coordinate.toString() :
            parseInt(coordinate, 10).toFixed(1);
    }

    inputVal(inputId, value) {
        let input = this.$el.find('#' + inputId);
        if(value) {
            input.val(this.formatCoordinate(value));
            return input;
        }
        return input.val();
    }

    north(value) {
        return this.inputVal('north', value);
    }

    south(value) {
        return this.inputVal('south', value);
    }

    east(value) {
        return this.inputVal('east', value);
    }

    west(value) {
        return this.inputVal('west', value);
    }

    lowerRightLat(value) {
        return this.inputVal('lowerRightLat', value);
    }

    lowerRightLon(value) {
        return this.inputVal('lowerRightLon', value);
    }

    upperLeftLat(value) {
        return this.inputVal('upperLeftLat', value);
    }

    upperLeftLon(value) {
        return this.inputVal('upperLeftLon', value);
    }

    checkExternalClick(event) {
        let $target, clickToDefineLatLonID, spatialSearchBox, spatialOptions,
            spatialTrigger, classNameExcludesSpatialTrigger;

        $target = $(event.target);
        clickToDefineLatLonID = 'compass-container';
        spatialSearchBox = 'spatial-search-box';
        spatialOptions = 'spatial-options';
        spatialTrigger = 'spatial-trigger';
        classNameExcludesSpatialTrigger = $target[0].className.indexOf && ($target[0].className.indexOf(spatialTrigger) === -1);

        if(!this.$el.hasClass('hidden') &&
            !$target.closest(this.$el).length &&
            (($target[0].id !== clickToDefineLatLonID) &&
                ($target[0].id !== spatialSearchBox) &&
                ($target[0].id !== spatialOptions) &&
                classNameExcludesSpatialTrigger)) {
            this.$el.addClass('hidden');
            this.clearSpatialSelection();
        }
    }

    onApplyAndClosePressed() {
        let nsew = {
            north: this.north(),
            south: this.south(),
            east: this.east(),
            west: this.west()
        };

        if(this.model.isValid(nsew)) {
            this.toggleVisibility();
            this.model.setFromNsewObject(nsew);
            this.clearSpatialSelection();
        }

    }

    onKeyPressedInInput(event) {
        if(event.which === 13) {  // if Enter is the pressed key
            this.onApplyAndClosePressed();
        }
    }

    bboxErrorsInitialRender() {
        this.hideAllBboxErrors();
    }

    getBboxErrorElementIDs(errorKey) {
        let matches, directionInputID, errorType, direction, identifier;

        matches = /([a-zA-Z]*)((Out|Input|Greater).*)/.exec(errorKey);
        direction = matches[1]; // north, south, east, west
        errorType = matches[2]; // InputNotNumber, OutOfRange, GreaterThanNorth

        if(errorType === 'GreaterThanNorth') {
            identifier = 'southGreaterThanNorth';
            directionInputID = ['#north', '#south'];
        }
        else if(errorType === 'GreaterThanEast') {
            identifier = 'westGreaterThanEast';
            directionInputID = ['#west', '#east'];
        }
        else if(errorType === 'OutOfRange') {
            identifier = direction + errorType;
            directionInputID = ['#' + direction];
        }
        else if(errorType === 'InputNotNumber') {
            identifier = errorType;
            directionInputID = ['#' + direction];
        }

        return {
            inputID: directionInputID,
            errorMessageID: '#bbox-error-' + identifier
        };
    }

    hideBboxErrorByIDpair(errorIDs) {
        this.$el.find(errorIDs.errorMessageID).hide();
        this.removeHighlighting(errorIDs.inputID);
    }

    hideAllBboxErrors() {
        let elements;
        _.each(this.model.errors, function (value, key) {
            elements = this.getBboxErrorElementIDs(key);
            this.hideBboxErrorByIDpair(elements);
        }, this);
    }

    showBboxError(errorKey) {
        let errorIDs = this.getBboxErrorElementIDs(errorKey);

        this.$el.find(errorIDs.errorMessageID).show();
        this.addHighlighting(errorIDs.inputID);
    }

    showBboxErrors(status) {
        this.hideAllBboxErrors();

        _.each(status, function (errorRaised, errorKey) {
            if(errorRaised) {
                this.showBboxError(errorKey);
            }
        }, this);
    }

    addHighlighting(elementIDs) {
        _.each(elementIDs, function (element) {
            this.$el.find(element).addClass('highlighting');
        }, this);
    }

    removeHighlighting(elementIDs) {
        _.each(elementIDs, function (element) {
            this.$el.find(element).removeClass('highlighting');
        }, this);
    }

    validateUserInputBbox() {
        let userBboxErrors,
            userBbox = {
                north: this.north(),
                south: this.south(),
                east: this.east(),
                west: this.west()
            };

        userBboxErrors = this.model.bboxErrors(userBbox);
        this.hideAllBboxErrors();

        if(!this.model.isValid(userBbox)) {
            this.showBboxErrors(userBboxErrors);
            return false;
        }

        return true;
    }

    validateUserInputCorners() {
        let errors,
            cornersBox = {
                upperLeftLat: this.upperLeftLat(),
                upperLeftLon: this.upperLeftLon(),
                lowerRightLat: this.lowerRightLat(),
                lowerRightLon: this.lowerRightLon()
            };

        this.hideAllBboxErrors();

        if(!this.model.isValidCornerPoints(cornersBox)) {
            errors = this.model.cornerErrors(cornersBox);
            this.showBboxErrors(errors);
            return false;
        }

        return true;
    }

    cancel() {
        this.hide();
        this.clearSpatialSelection();
    }

    clearSpatialSelection() {
        this.bboxErrorsInitialRender();
        this.clearCorners();
        this.mapSelectionCleared();
        this.clearMap(mapConstants.PROJECTION_NAMES[this.currentMapProjection]);
    }

    reset() {
        this.mediator.trigger('search:resetBoundingBox');
        this.clearSpatialSelection();
    }

    clearMap(projection) {
        this.mediator.trigger('map:reset', projection);
    }

    toggleVisibility() {
        this.$el.toggleClass('hidden');
        this.$el.css('display', '');
    }

    hide() {
        this.$el.addClass('hidden');
    }

    boundingBoxUpdate() {
        let west = parseFloat(this.west()),
            east = parseFloat(this.east()),
            north = parseFloat(this.north()),
            south = parseFloat(this.south());

        if(this.validateUserInputBbox()) {
            if(west > east) {
                west -= 360;
            }

            this.mediator.trigger('map:changeGlobalCoords', north, west, south, east);
        }
    }

    mapBoundingBoxChanged(boundingBox) {
        this.north(boundingBox.north);
        this.south(boundingBox.south);
        this.east(boundingBox.east);
        this.west(boundingBox.west);

        this.validateUserInputBbox();
    }

    coordinatesUpdate() {
        let upperLeftLat = parseFloat(this.upperLeftLat()),
            upperLeftLon = parseFloat(this.upperLeftLon()),
            lowerRightLat = parseFloat(this.lowerRightLat()),
            lowerRightLon = parseFloat(this.lowerRightLon());

        if(this.validateUserInputCorners()) {
            this.mediator.trigger('map:changePolarCoords', upperLeftLat, upperLeftLon, lowerRightLat, lowerRightLon);
        }
    }

    mapCoordinatesChanged(cornerPoints) {
        this.lowerRightLat(cornerPoints.lowerRightLat);
        this.lowerRightLon(cornerPoints.lowerRightLon);
        this.upperLeftLat(cornerPoints.upperLeftLat);
        this.upperLeftLon(cornerPoints.upperLeftLon);

        this.validateUserInputCorners();
    }

    mapSelectionCleared() {
        this.north(this.model.get('northDefault'));
        this.south(this.model.get('southDefault'));
        this.east(this.model.get('eastDefault'));
        this.west(this.model.get('westDefault'));
    }

    northProjectionClicked() {
        this.currentMapProjection = 'EASE_GRID_NORTH';
        this.changeProjection(mapConstants.PROJECTION_NAMES.EASE_GRID_NORTH);
    }

    globalProjectionClicked() {
        this.currentMapProjection = 'GLOBAL';
        this.changeProjection(mapConstants.PROJECTION_NAMES.GLOBAL);
    }

    southProjectionClicked() {
        this.currentMapProjection = 'EASE_GRID_SOUTH';
        this.changeProjection(mapConstants.PROJECTION_NAMES.EASE_GRID_SOUTH);
    }

    showCorners() {
        let nsewDiv = this.$el.find('#spatialInput_nsew'),
            cornersDiv = this.$el.find('#spatialInput_corners');
        cornersDiv.removeClass('hidden');
        nsewDiv.addClass('hidden');
    }

    clearCorners() {
        this.$el.find('#spatialInput_corners input').val('');
    }

    showNSEW() {
        let nsewDiv = this.$el.find('#spatialInput_nsew'),
            cornersDiv = this.$el.find('#spatialInput_corners');
        nsewDiv.removeClass('hidden');
        cornersDiv.addClass('hidden');
    }

    changeProjection(newProjection) {
        if(newProjection === mapConstants.PROJECTION_NAMES.EASE_GRID_NORTH ||
            newProjection === mapConstants.PROJECTION_NAMES.EASE_GRID_SOUTH) {
            this.clearCorners();
            this.showCorners();
        }
        else if(newProjection === mapConstants.PROJECTION_NAMES.GLOBAL) {
            this.mapSelectionCleared();
            this.showNSEW();
        }
        this.clearMap(newProjection);
    }

    getProjectionIdentifierByName(projectionName) {
        if(projectionName === 'EASE_GRID_NORTH') {
            return 'north';
        }
        else if(projectionName === 'EASE_GRID_SOUTH') {
            return 'south';
        }
        return 'global';
    }

}

export default SpatialCoverageCompassView;
