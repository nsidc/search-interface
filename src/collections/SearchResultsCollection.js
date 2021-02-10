define(['lib/mediator_mixin', 'lib/utility_functions'],
       function (mediatorMixin, utilityFunctions) {

  var SearchResultsCollection = Backbone.Collection.extend({

    initialize: function (options) {
      if (options && options.osDefaultParameters && (! options.osDefaultParameters.osdd)) {
        throw new Error('undefined OSDD URL value in configuration');
      }
      if (options !== undefined) {
        this.provider = options.provider;
        this.osDefaultParameters = options.osDefaultParameters;
        this.keyword = '';
        this.startDate = '';
        this.endDate = '';
        this.geoBoundingBox = options.geoBoundingBox;
      }

      this.bindEvents();
    },

    bindEvents: function () {
      this.mediatorBind('search:initiated', this.onSearchInitiated, this);
      this.mediatorBind('search:refinedSearch', this.onRefinedSearch, this);
    },

    onSearchInitiated: function (model) {
      this.performSearch(model, this.onSearchInitiatedSuccess);
    },

    onRefinedSearch: function (model) {
      this.performSearch(model, this.onSearchRefinedSuccess);
    },

    performSearch: function (model, successMethod) {
      var startPage = model.get('pageNumber'),
        itemsPerPage = model.get('itemsPerPage');

      this.provider.requestJSON({
        contentType: 'application/atom+xml',
        osParameters: {
          osdd: this.osDefaultParameters.osdd,
          osSource: this.osDefaultParameters.osSource,
          osStartIndex: (startPage - 1) * itemsPerPage + 1,
          osItemsPerPage: itemsPerPage,
          osSearchTerms: model.get('keyword'),
          osAuthor: model.get('author'),
          osParameter: model.get('parameter'),
          osSensor: model.get('sensor'),
          osTitle: model.get('title'),
          osFacetFilters: model.get('facetFilters'),
          geoBoundingBox: model.get('geoBoundingBox'),
          osGeoRel: this.osDefaultParameters.osGeoRel,
          osDtStart: model.get('startDate'),
          osDtEnd: model.get('endDate'),
          osSortKeys: model.get('sortKeys'),
          osRequestHeaders: this.osDefaultParameters.osRequestHeaders
        },
        success: _.bind(successMethod, this),
        error : _.bind(this.onErrorResponse, this)
      });
    },

    getGeoBoundingBox: function () {
      return this.geoBoundingBox || '';
    },

    // Return the geo bounding box as identifier for the URL
    getOsGeoBbox: function () {
      return utilityFunctions.osGeoBoxToIdentifier(this.geoBoundingBox);
    },

    getNorth: function () {
      var bboxArray, north;

      bboxArray = this.geoBoundingBox.split(',');
      north = parseFloat(bboxArray[3], 10);

      return north;
    },

    getSouth: function () {
      var bboxArray = this.geoBoundingBox.split(','),
      south = parseFloat(bboxArray[1], 10);

      return south;
    },

    getEast: function () {
      var bboxArray = this.geoBoundingBox.split(','),
      east = parseFloat(bboxArray[2], 10);

      return east;
    },

    getWest: function () {
      var bboxArray = this.geoBoundingBox.split(','),
      west = parseFloat(bboxArray[0], 10);

      return west;
    },

    getItemsPerPage: function () {
      return this.itemsPerPage;
    },

    getPageNumber: function () {
      return this.pageNumber;
    },

    getLastPageNumber: function () {
      return this.lastPage;
    },

    getTotalResultsCount: function () {
      return this.totalResultsCount;
    },

    // prevent undefined keywords.
    getKeyword: function () {
      return this.keyword || '';
    },

    getAuthor: function () {
      return this.author;
    },

    getParameter: function () {
      return this.parameter;
    },

    getSensor: function () {
      return this.sensor;
    },

    getTitle: function () {
      return this.title;
    },

    getPopulatedTerms: function () {
      var termFields = {
        all:  this.getKeyword(),
        author: this.getAuthor(),
        parameter: this.getParameter(),
        sensor: this.getSensor(),
        title: this.getTitle()
      },
      terms = {};

      function termsFieldHasValue(termsField) {
        if (termsField === null || termsField === undefined || termsField.length === 0) {
          return false;
        }
        return true;
      }
      _.each(_.keys(termFields), function (key) {
        if (termsFieldHasValue(termFields[key])) {
          terms[key] = termFields[key];
        }
      });

      return terms;
    },

    getStartDate: function () {
      return this.startDate || '';
    },

    getEndDate: function () {
      return this.endDate || '';
    },

    getSortKeys: function () {
      return this.sortKeys || '';
    },

    getFacetFilters: function () {
      return this.facetFilters || {};
    },

    onSearchInitiatedSuccess: function (json) {
      this.onNewSearchResultData(json);
      this.mediatorTrigger('search:fullSearchComplete');
    },

    onSearchRefinedSuccess: function (json) {
      this.onNewSearchResultData(json);
      this.mediatorTrigger('search:refinedSearchComplete');
    },

    onNewSearchResultData: function (json) {
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
        this.mediatorTrigger('search:noResults');
      } else {
        this.mediatorTrigger('search:complete');
      }
    },

    onErrorResponse : function (errorXHR) {
      if (errorXHR.statusText !== 'abort') {
        this.reset();
        this.mediatorTrigger('search:error');
      }
    },

    // deprecated functions for retrieving parameters based on old URLs

    getKeywords: function () {
      return this.getKeyword();
    },

    getP: function () {
      return this.getPageNumber();
    },

    getBbox: function () {
      return this.getOsGeoBbox();
    },

    getPsize: function () {
      return this.getItemsPerPage();
    }
  });

  // Mix in the mediator behaviour
  _.extend(SearchResultsCollection.prototype, mediatorMixin);

  return SearchResultsCollection;
});
