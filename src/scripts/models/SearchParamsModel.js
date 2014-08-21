define([
  'lib/utility_functions',
  'lib/mediator_mixin'
],
       function (
         utilityFunctions,
         mediatorMixin
       ) {

  var SearchParamsModel, sanitizePageNumber, getMutatorName,
      defaultItemsPerPage;

  // TODO: Is this method duplicated in utilityFunctions?
  // Ensures the input is convertible to an integer greater than 1, and throws
  // errors if it's not.
  // Returns an integer greater than zero
  sanitizePageNumber = function (input) {
    input = utilityFunctions.toNumber(input, 'int', 'Requested page number must be a number');

    if (input < 1) {
      throw new Error('Requested page number must be greater than 0');
    }

    return input;
  };

  getMutatorName = function (propertyName) {
    return 'set' + utilityFunctions.toInitialCaps(propertyName);
  };

  SearchParamsModel = Backbone.Model.extend({
    initialize: function () {
      this.set('pageNumber', 1);
      defaultItemsPerPage = this.get('defaults').osItemsPerPage;
      this.set('itemsPerPage', defaultItemsPerPage);

      this.setParamsFromDefaultsIfNotSet();

      this.bindEvents();
    },

    bindEvents: function () {
      this.mediatorBind('model:toggleFacet', this.toggleFacet, this);
      this.mediatorBind('model:clearFacet', this.clearFacet, this);
      this.mediatorBind('app:home', this.onAppHome, this);
    },

    onAppHome: function () {
      this.resetCriteria();
      this.resetFacetFilters();
    },

    toggleFacet: function (facet, name) {
      var index, facetFilters = $.extend(true, {}, this.get('facetFilters'));

      if (facet in facetFilters) {

        index = facetFilters[facet].indexOf(name);

        if (index > -1) {
          facetFilters[facet].splice(index, 1);
          if (facetFilters[facet].length === 0) {
            delete facetFilters[facet];
          }
        } else {
          facetFilters[facet].push(name);
        }

      } else {
        facetFilters[facet] = [name];
      }

      this.set('facetFilters', facetFilters);
      this.set('pageNumber', 1);
      this.mediatorTrigger('search:refinedSearch', this);
    },

    clearFacet: function (facet) {
      var facetFilters = $.extend(true, {}, this.get('facetFilters'));
      if (facet in facetFilters) {
        delete facetFilters[facet];
        this.set('facetFilters', facetFilters);
        this.mediatorTrigger('search:refinedSearch', this);
      }
    },

    setParamsFromDefaultsIfNotSet: function () {
      var params = {
        'keyword': 'osSearchTerms',
        'author': 'osAuthor',
        'parameter': 'osParameter',
        'sensor': 'osSensor',
        'title': 'osTitle',
        'startDate': 'osDtStart',
        'endDate': 'osDtEnd',
        'sortKeys': 'osSortKeys',
        'geoBoundingBox': 'osGeoBbox',
        'facetFilters': 'osFacetFilters'
      };

      if (this.get('defaults')) {

        _.each(params, function (osDefaultOpt, param) {
          if (!this.get(param)) {
            this.set(param, this.get('defaults')[osDefaultOpt]);
          }
        }, this);

      }
    },

    isSetToDefaults : function () {
      return ((this.get('keyword') === this.get('defaults').osSearchTerms) &&
              (this.get('startDate') === this.get('defaults').osDtStart) &&
              (this.get('endDate') === this.get('defaults').osDtEnd) &&
              (this.get('geoBoundingBox') === this.get('defaults').osGeoBbox));
    },

    setPageNumber : function (input, backboneOptions) {
      var intPageVal;
      if (input === undefined) {
        intPageVal = 1;
      } else {
        intPageVal = sanitizePageNumber(input);
      }

      this.set('pageNumber', intPageVal, backboneOptions);
    },

    setItemsPerPage: function (input, backboneOptions) {
      var intItemsPerPage, newPage, firstResultPos;
      if (input === undefined) {
        intItemsPerPage = defaultItemsPerPage;
      } else {
        intItemsPerPage = parseInt(input, 10);
      }

      if (typeof(this.get('itemsPerPage')) !== 'undefined') {
        firstResultPos = this.get('itemsPerPage') * (this.get('pageNumber') - 1);
        newPage = Math.floor(firstResultPos / intItemsPerPage) + 1;
        this.setPageNumber(newPage);
      }

      this.set('itemsPerPage', intItemsPerPage, backboneOptions);
    },

    setKeyword: function (keywords, backboneOptions) {
      this.setKeywordAndConstraint('keyword', keywords, backboneOptions);
    },

    setAuthor: function (keywords, backboneOptions) {
      this.setKeywordAndConstraint('author', keywords, backboneOptions);
    },

    setParameter: function (keywords, backboneOptions) {
      this.setKeywordAndConstraint('parameter', keywords, backboneOptions);
    },

    setSensor: function (keywords, backboneOptions) {
      this.setKeywordAndConstraint('sensor', keywords, backboneOptions);
    },

    setTitle: function (keywords, backboneOptions) {
      this.setKeywordAndConstraint('title', keywords, backboneOptions);
    },

    setFacetFilters: function (obj, backboneOptions) {
      this.set('facetFilters', obj, backboneOptions);
    },

    setKeywordAndConstraint: function (searchParam, keywords, backboneOptions) {
      if (keywords instanceof Array !== true) {
        throw new TypeError('Keywords must be an array');
      }

      this.set(searchParam, keywords, backboneOptions);
    },

    setStartDate: function (startDate, backboneOptions) {
      this.set('startDate', startDate, backboneOptions);
    },

    setEndDate: function (endDate, backboneOptions) {
      this.set('endDate', endDate, backboneOptions);
    },

    setSortKeys: function (sortKeys, backboneOptions) {
      this.set('sortKeys', sortKeys, backboneOptions);
    },

    // this model's geoBoundingBox is a string formatted for opensearch: $W,$S,$E,$N
    setGeoBoundingBox: function (geoBoundingBox, backboneOptions) {
      if (geoBoundingBox === '' || geoBoundingBox === undefined) {
        geoBoundingBox = this.get('defaults').osGeoBbox;
      }

      this.set('geoBoundingBox', geoBoundingBox, backboneOptions);
    },

    // set the model's box using the 'identifier' string form: N:$N,S:$S,E:$E,W:$W
    setOsGeoBbox: function (geoBBAsURLPart, backboneOptions) {
      var bbox = utilityFunctions.osGeoBoxFromIdentifier(geoBBAsURLPart);
      this.setGeoBoundingBox(bbox, backboneOptions);
    },

    setCriteria: function (criteria) {

      // reset any data the model may have
      this.resetCriteria();

      _.each(criteria, function (value, propertyName) {
        var mutatorFn = this[getMutatorName(propertyName)];

        if (mutatorFn !== undefined && typeof mutatorFn === 'function') {
          mutatorFn.call(this, value);
        } else {
          throw new Error('The parameter ' + propertyName + ' is not known.');
        }
      }, this);

      return this;
    },

    removeSearchTerm: function (term) {
      var searchTermFields = ['keyword', 'author', 'parameter', 'sensor', 'title'];

      _.each(searchTermFields, function (field) {
        var terms = this.get(field);

        terms = typeof terms === 'string' ? [terms] : terms;

        if (terms) {
          terms.splice(_.indexOf(terms, term), 1);

          this.unset(field);
          this.set(field, terms);
        }

      }, this);
    },

    resetKeywords: function () {
      this.set('keyword', this.get('defaults').osSearchTerms);
    },

    resetAuthors: function () {
      this.set('author', this.get('defaults').osAuthor);
    },

    resetParameters: function () {
      this.set('parameter', this.get('defaults').osParameter);
    },

    resetSensors: function () {
      this.set('sensor', this.get('defaults').osSensor);
    },

    resetTitles: function () {
      this.set('title', this.get('defaults').osTitle);
    },

    resetFacetFilters: function () {
      this.set('facetFilters', this.get('defaults').osFacetFilters);
    },

    resetSpatialCoverage: function () {
      this.set('geoBoundingBox', this.get('defaults').osGeoBbox);
    },

    resetTemporalCoverage: function () {
      this.set('startDate', this.get('defaults').osDtStart);
      this.set('endDate', this.get('defaults').osDtEnd);
    },

    resetCriteria: function () {
      this.set('pageNumber', 1);
      this.set('itemsPerPage', defaultItemsPerPage);
      this.unset('keyword');
      this.unset('author');
      this.unset('parameter');
      this.unset('sensor');
      this.unset('title');
      this.unset('startDate');
      this.unset('endDate');
      this.unset('sortKeys');

      this.setParamsFromDefaultsIfNotSet();
    },

    reset: function (options) {
      this.setPageNumber('1', options);
      this.setItemsPerPage(defaultItemsPerPage, options);
      this.unset('keyword', options);
      this.unset('author', options);
      this.unset('parameter', options);
      this.unset('sensor', options);
      this.unset('title', options);
      this.unset('facetFilters', options);
      this.unset('startDate', options);
      this.unset('endDate', options);
      this.unset('sortKeys', options);
      this.unset('geoBoundingBox', options);

      this.setParamsFromDefaultsIfNotSet();
    },

    setKeywords: function () {
      this.setKeyword.apply(this, arguments);
    },

    setP: function () {
      this.setPageNumber.apply(this, arguments);
    },

    setBbox: function () {
      this.setOsGeoBbox.apply(this, arguments);
    },

    setPsize: function () {
      this.setItemsPerPage.apply(this, arguments);
    }
  });

  // Mix in the mediator behaviour
  _.extend(SearchParamsModel.prototype, mediatorMixin);

  return SearchParamsModel;
});
