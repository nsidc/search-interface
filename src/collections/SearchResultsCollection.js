import * as Backbone from 'backbone';
import _ from 'underscore';
import * as UtilityFunctions from '../lib/utility_functions';

class SearchResultsCollection extends Backbone.Collection {

    constructor(models, options) {
        super(models, options);
        if (options && options.osDefaultParameters && (!options.osDefaultParameters.osdd)) {
            throw new Error('undefined OSDD URL value in configuration');
        }
        if (options !== undefined) {
            this.mediator = options.mediator;
            this.provider = options.provider;
            this.osDefaultParameters = options.osDefaultParameters;
            this.keyword = '';
            this.startDate = '';
            this.endDate = '';
            this.geoBoundingBox = options.geoBoundingBox;
        }

        this.bindEvents(this.mediator);
    }

    bindEvents() {
        this.mediator?.on('search:initiated', this.onSearchInitiated, this);
        this.mediator?.on('search:refinedSearch', this.onRefinedSearch, this);
    }

    onSearchInitiated(model) {
        this.performSearch(model, this.onSearchInitiatedSuccess);
    }

    onRefinedSearch(model) {
        this.performSearch(model, this.onSearchRefinedSuccess);
    }

    performSearch(model, successMethod) {
        let osParams = UtilityFunctions.getOsParameters(model, this.osDefaultParameters);

        this.provider.requestJSON({
            contentType: this.osDefaultParameters.osSearchContentType,
            osParameters: osParams,
            success: _.bind(successMethod, this),
            error: _.bind(this.onErrorResponse, this)
        });
    }

    getGeoBoundingBox() {
        return this.geoBoundingBox || '';
    }

    // Return the geo bounding box as identifier for the URL
    getOsGeoBbox() {
        return UtilityFunctions.osGeoBoxToIdentifier(this.geoBoundingBox);
    }

    getNorth() {
        var bboxArray, north;

        bboxArray = this.geoBoundingBox.split(',');
        north = parseFloat(bboxArray[3], 10);

        return north;
    }

    getSouth() {
        var bboxArray = this.geoBoundingBox.split(','),
            south = parseFloat(bboxArray[1], 10);

        return south;
    }

    getEast() {
        var bboxArray = this.geoBoundingBox.split(','),
            east = parseFloat(bboxArray[2], 10);

        return east;
    }

    getWest() {
        var bboxArray = this.geoBoundingBox.split(','),
            west = parseFloat(bboxArray[0], 10);

        return west;
    }

    getItemsPerPage() {
        return this.itemsPerPage;
    }

    getPageNumber() {
        return this.pageNumber;
    }

    getLastPageNumber() {
        return this.lastPage;
    }

    getTotalResultsCount() {
        return this.totalResultsCount || 0;
    }

    // This is used by both by setSearchTermField in KeywordsView and generateUrl
    // in criteriaAppender. The latter dynamically creates an accessor (getter) for
    // each of the properties listed in routeHandlerProperties (see SearchApp.js
    // initialization).
    getKeywords() {
        // prevent undefined keywords.
        return this.keyword || '';
    }

    getAuthor() {
        return this.author;
    }

    getParameter() {
        return this.parameter;
    }

    getSensor() {
        return this.sensor;
    }

    getTitle() {
        return this.title;
    }

    getStartDate() {
        return this.startDate || '';
    }

    getEndDate() {
        return this.endDate || '';
    }

    getSortKeys() {
        return this.sortKeys || '';
    }

    getFacetFilters() {
        return this.facetFilters || {};
    }

    onSearchInitiatedSuccess(json) {
        this.onNewSearchResultData(json);
        this.mediator?.trigger('search:success');
        this.mediator?.trigger('search:fullSearchComplete');
    }

    onSearchRefinedSuccess(json) {
        this.onNewSearchResultData(json);
        this.mediator?.trigger('search:success');
        this.mediator?.trigger('search:refinedSearchComplete');
    }

    onNewSearchResultData(json) {
        this.itemsPerPage = json.getItemsPerPage() || this.osDefaultParameters.osItemsPerPage;
        this.pageNumber = Math.floor(json.getCurrentIndex() / this.getItemsPerPage()) + 1;
        this.lastPage = Math.ceil(json.getTotalCount() / this.getItemsPerPage());
        this.totalResultsCount = parseInt(json.getTotalCount(), 10);
        this.keyword = json.getKeyword();
        this.author = json.getAuthorTerms();
        this.parameter = json.getParameterTerms();
        this.sensor = json.getSensorTerms();
        this.title = json.getTitleTerms();
        this.startDate = json.getStartDate();
        this.endDate = json.getEndDate();
        this.sortKeys = json.getSortKeys();
        this.geoBoundingBox = json.getGeoBoundingBox();
        this.reset(json.getResults());
        this.facetFilters = json.getFacetFilters();

        if (this.totalResultsCount === 0) {
            this.mediator?.trigger('search:noResults');
        } else {
            this.mediator?.trigger('search:complete');
        }
    }

    onErrorResponse(errorXHR) {
        if (errorXHR.statusText !== 'abort') {
            this.reset();
            this.mediator?.trigger('search:error');
        }
    }
}

export default SearchResultsCollection;
