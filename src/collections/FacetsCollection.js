/* jshint esversion: 6 */

import * as Backbone from 'backbone';
import _ from 'underscore';
//import FacetModel from '../models/FacetModel';

class FacetsCollection extends Backbone.Collection {

    //model: FacetModel,

    initialize(options) {
      if (options !== undefined) {
          this.mediator = options.mediator;
        this.osDefaultParameters = options.osDefaultParameters;
        this.facets = options.facets;
        this.facetsEnabled = options.facetsEnabled;
        this.provider = options.provider;
      }

      this.bindEvents(this.mediator);
    }

    bindEvents() {
      this.mediator.on('search:initiated', this.onSearchInitiated, this);
      this.mediator.on('search:refinedSearch', this.onRefinedSearch, this);
      this.mediator.on('search:datacentersOnly', this.onDatacentersOnly, this);
      this.mediator.on('search:urlParams', this.onSearchUrlParams, this);
    }

    onSearchInitiated(model) {
      this.performFacetSearch(model, this.onSearchInitiatedFacetsData);
    }

    onRefinedSearch(model) {
      this.performFacetSearch(model, this.onRefinedSearchFacetsData);
    }

    onDatacentersOnly(model) {
      this.performFacetSearch(model, this.onDatacentersOnlyFacetsData);
    }

    onSearchUrlParams(model, facetFilters) {
      this.performFacetSearch(model, function (json) {
        this.onUrlParamsFacetsData(json, model, facetFilters);
      });
    }

    performFacetSearch(model, successMethod) {
      let startPage, itemsPerPage;

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
    }

    getFacets() {
      return this.facets;
    }

    onSearchInitiatedFacetsData(json) {
      this.reset(json.getFacets());

      if (this.countFacetValues(json.getFacets()) > 0) {
        this.mediatorTrigger('search:facetsReturned');
      }
    }

    onRefinedSearchFacetsData(json) {
      let newFacetData, newFacetValue;

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
    }

    onDatacentersOnlyFacetsData(json) {
      this.mediatorTrigger('search:datacentersReturned', json.getFacet('facet_data_center'));
    }

    onUrlParamsFacetsData(json, model, facetFilters) {
      this.reset(json.getFacets());
      model.setFacetFilters(facetFilters);
      if (this.countFacetValues(json.getFacets()) > 0) {
        this.mediatorTrigger('search:facetsReturned');
        this.mediatorTrigger('search:refinedSearch', model);
      }
      else {
        // Possible that data could come back with no facets.
        // Instead of spinning the loading symbol forever,
        // go through normal search event workflow
        this.mediatorTrigger('search:initiated', model);
      }
    }

    onErrorResponse(errorXHR) {
      if (errorXHR.statusText !== 'abort') {
        this.reset();
        this.mediatorTrigger('search:error');
      }
    }

    countCaps(str) {
      return str.replace(/[^A-Z]/g, '').length;
    }

    countFacetValues(facets) {
      let numValues = 0;

      _.each(facets, function (facet) {
        _.each(facet.values, function (value) {
          numValues += parseInt(value.count, 10);
        }, this);
      }, this);

      return numValues;
    }

}

export default FacetsCollection;
