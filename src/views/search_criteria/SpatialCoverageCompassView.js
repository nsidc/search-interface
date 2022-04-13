import Backbone from 'backbone';
import _ from 'underscore';
import $ from 'jquery';

import SearchMap from '../../lib/SearchMap';
import { DEFAULT_LAYER_TITLE, MAP_LAYER_TITLES } from '../../lib/spatial_selection_map/constants';
import viewTemplate from '../../templates/search_criteria/compass.html';

class SpatialCoverageCompassView extends Backbone.View {

    get events() {
        return {
            'click #submit-coordinates': 'onApplyAndClosePressed',
            'click .reset-coordinates': 'reset',
            'click #cancel-coordinates': 'cancel',
            'keypress input': 'onKeyPressedInInput',
            'blur .compassInput input': 'boundingBoxUpdate',
            'click input#spatial_srid_north': 'northProjectionClicked',
            'click input#spatial_srid_global': 'globalProjectionClicked',
            'click input#spatial_srid_south': 'southProjectionClicked'
        };
    }

    initialize(options) {
        this.options = options;
        this.mediator = options.mediator;

        this.defaultMapView = this.options?.config?.map?.view || DEFAULT_LAYER_TITLE;
        this.currentMapView = this.defaultMapView;

        this.hide();
        this.bindEvents(this.mediator);
        _.bindAll(this,
            'checkExternalClick',
            'mapBoundingBoxChanged',
            'mapSelectionCleared');
    }

    bindEvents(mediator) {
        this.model.on('change', this.onModelChange, this);
        mediator.on('search:initiated', this.onSearchInitiated, this);
        mediator.on('map:clearSelection', this.mapSelectionCleared, this);
        mediator.on('map:changeBoundingBox', this.mapBoundingBoxChanged, this);
        mediator.on('map:redrawBoundingBox', this.boundingBoxUpdate, this);
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
        this.boundingBoxUpdate();
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
        this.map = new SearchMap({
            mapContainerId: 'map-container',
            mediator: this.mediator,
        });
    }

    selectDefaultMapView() {
        var projection = this.defaultMapView.toLowerCase(),
            selectMapViewElementID = '#spatial_srid_' + projection;
        $(selectMapViewElementID).click();
    }

    render() {
        this.$el.html(_.template(viewTemplate)({
            northValue: this.model.getNorth(),
            southValue: this.model.getSouth(),
            eastValue: this.model.getEast(),
            westValue: this.model.getWest(),
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
        this.$el.find('div[id^=bbox-error-]').hide();
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

        this.hideAllBboxErrors();

        if(!this.model.isValid(userBbox)) {
            userBboxErrors = this.model.bboxErrors(userBbox);
            this.showBboxErrors(userBboxErrors);
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
        this.mapSelectionCleared();
    }

    reset() {
        this.mediator.trigger('search:resetBoundingBox');
        this.clearSpatialSelection();
    }

    toggleVisibility() {
        this.$el.toggleClass('hidden');
        this.$el.css('display', '');
        this.map.render();
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
            this.mediator.trigger('map:changeCoordinates', north, west, south, east);
        }
    }

    mapBoundingBoxChanged(boundingBox) {
        this.north(boundingBox.north);
        this.south(boundingBox.south);
        this.east(boundingBox.east);
        this.west(boundingBox.west);

        this.validateUserInputBbox();
    }

    mapSelectionCleared() {
        this.north(this.model.get('northDefault'));
        this.south(this.model.get('southDefault'));
        this.east(this.model.get('eastDefault'));
        this.west(this.model.get('westDefault'));

        this.mediator.trigger('map:reset');
    }

    northProjectionClicked() {
        this.currentMapView = MAP_LAYER_TITLES.NORTHERN_HEMI;
        this.changeProjection(MAP_LAYER_TITLES.NORTHERN_HEMI);
    }

    globalProjectionClicked() {
        this.currentMapView = MAP_LAYER_TITLES.GLOBAL;
        this.changeProjection(MAP_LAYER_TITLES.GLOBAL);
    }

    southProjectionClicked() {
        this.currentMapView = MAP_LAYER_TITLES.SOUTHERN_HEMI;
        this.changeProjection(MAP_LAYER_TITLES.SOUTHERN_HEMI);
    }

    changeProjection(newProjection) {
        this.mediator.trigger('map:switchView', newProjection);
    }
}

export default SpatialCoverageCompassView;
