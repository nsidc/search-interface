define([
  'lib/mediator_mixin',
  'models/FacetModel'
],
       function (
         mediatorMixin,
         FacetModel
       ) {

  var FacetsCollection = Backbone.Collection.extend({

    model: FacetModel,

    initialize: function (options) {
      if (options !== undefined) {
        this.osDefaultParameters = options.osDefaultParameters;
        this.facets = options.facets;
        this.facetsEnabled = options.facetsEnabled;
        this.provider = options.provider;
      }

      this.bindEvents();
    },

    bindEvents: function () {
      this.mediatorBind('search:initiated', this.onSearchInitiated, this);
      this.mediatorBind('search:refinedSearch', this.onRefinedSearch, this);
      this.mediatorBind('search:datacentersOnly', this.onDatacentersOnly, this);
      this.mediatorBind('search:urlParams', this.onSearchUrlParams, this);
    },

    onSearchInitiated: function (model) {
      this.performFacetSearch(model, this.onSearchInitiatedFacetsData);
    },

    onRefinedSearch: function (model) {
      this.performFacetSearch(model, this.onRefinedSearchFacetsData);
    },

    onDatacentersOnly: function (model) {
      this.performFacetSearch(model, this.onDatacentersOnlyFacetsData);
    },

    onSearchUrlParams: function (model, facetFilters) {
      this.performFacetSearch(model, function (json) {
        this.onUrlParamsFacetsData(json, model, facetFilters);
      });
    },

    performFacetSearch: function (model, successMethod) {
      var startPage, itemsPerPage;

      if (!this.facetsEnabled) {
        return;
      }

      startPage = model.get('pageNumber');
      itemsPerPage = model.get('itemsPerPage');

      this.provider.requestJSON({
        contentType: 'application/nsidc:facets+xml',
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
          osRequestHeaders: this.osDefaultParameters.osRequestHeaders
        },
        success: _.bind(successMethod, this),
        error : _.bind(this.onErrorResponse, this)
      });
    },

    getFacets: function () {
      return this.facets;
    },

    onSearchInitiatedFacetsData: function (json) {
      this.reset(json.getFacets());

      if (this.countFacetValues(json.getFacets()) > 0) {
        this.mediatorTrigger('search:facetsReturned');
      }
    },

    onRefinedSearchFacetsData: function (json) {
      var newFacetData, newFacetValue;

      this.forEach(function (facetCategory) {
        newFacetData = json.getFacet(facetCategory.id);
        _.each(facetCategory.attributes.values, function (facetValue) {
          newFacetValue = json.findFacetValue(newFacetData, facetValue.fullName);
          if (newFacetValue) {
            facetValue.count = newFacetValue.count;
          } else {
            facetValue.count = '0';
          }
        });
      });
      this.mediatorTrigger('search:facetsRefined');
    },

    onDatacentersOnlyFacetsData: function (json) {
      this.mediatorTrigger('search:datacentersReturned', json.getFacet('facet_data_center'));
    },

    onUrlParamsFacetsData: function (json, model, facetFilters) {
      this.reset(json.getFacets());
      model.setFacetFilters(facetFilters);
      if (this.countFacetValues(json.getFacets()) > 0) {
        this.mediatorTrigger('search:facetsReturned');
        this.mediatorTrigger('search:refinedSearch', model);
      }
    },

    onErrorResponse: function (errorXHR) {
      if (errorXHR.statusText !== 'abort') {
        this.reset();
        this.mediatorTrigger('search:error');
      }
    },

    countCaps: function (str) {
      return str.replace(/[^A-Z]/g, '').length;
    },

    countFacetValues: function (facets) {
      var numValues = 0;

      _.each(facets, function (facet) {
        _.each(facet.values, function (value) {
          numValues += parseInt(value.count, 10);
        }, this);
      }, this);

      return numValues;
    }

  });

  // Mix in the mediator behaviour
  _.extend(FacetsCollection.prototype, mediatorMixin);

  return FacetsCollection;
});
