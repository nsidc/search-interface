import Backbone from 'backbone';
import _ from 'underscore';
import FacetModel from '../models/FacetModel';
import * as UtilityFunctions from '../lib/utility_functions';

class FacetsCollection extends Backbone.Collection {
    get model() {
        return FacetModel;
    }

    constructor(models, options) {
        super(models, options);
        this.mediator = options?.mediator;
        this.osDefaultParameters = options?.osDefaultParameters;
        this.facetsEnabled = options?.config?.facets.enabled;
        this.provider = options?.provider;
        this.bindEvents();
    }

    bindEvents() {
        this.mediator?.on('search:initiated', this.onSearchInitiated, this);
        this.mediator?.on('search:refinedSearch', this.onRefinedSearch, this);
        this.mediator?.on('search:datacentersOnly', this.onDatacentersOnly, this);
        this.mediator?.on('search:urlParams', this.onSearchUrlParams, this);
        this.mediator?.on('search:noResults', this.onNoResults, this);
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
        this.performFacetSearch(model, function(json) {
            this.onUrlParamsFacetsData(json, model, facetFilters);
        });
    }

    performFacetSearch(model, successMethod) {
        if (!this.facetsEnabled) {
            return;
        }

        let osParams = UtilityFunctions.getOsParameters(model, this.osDefaultParameters);

        this.provider.requestJSON({
            contentType: this.osDefaultParameters.osFacetContentType,
            osParameters: osParams,
            success: _.bind(successMethod, this),
            error: _.bind(this.onErrorResponse, this)
        });
    }

    getFacets() {
        return this.facets;
    }

    onSearchInitiatedFacetsData(json) {
        this.reset(json.getFacets());

        if (this.countFacetValues(json.getFacets()) > 0) {
            this.mediator?.trigger('search:facetsReturned');
        }
    }

    onRefinedSearchFacetsData(json) {
        let newFacetData, newFacetValue;

        this.forEach(function(facetCategory) {
            newFacetData = json.getFacet(facetCategory.id);
            _.each(facetCategory.attributes.values, function(facetValue) {
                newFacetValue = json.findFacetValue(newFacetData, facetValue.fullName);
                if (newFacetValue) {
                    facetValue.count = newFacetValue.count;
                } else {
                    facetValue.count = '0';
                }
            });
        });

        this.mediator?.trigger('search:facetsRefined');
    }

    onDatacentersOnlyFacetsData(json) {
        this.mediator?.trigger('search:datacentersReturned', json.getFacet('facet_data_center'));
    }

    onUrlParamsFacetsData(json, model, facetFilters) {
        this.reset(json.getFacets());
        model.setFacetFilters(facetFilters);
        if (this.countFacetValues(json.getFacets()) > 0) {
            this.mediator.trigger('search:facetsReturned');
            this.mediator.trigger('search:refinedSearch', model);
        }
        else {
            // Possible that data could come back with no facets.
            // Instead of spinning the loading symbol forever,
            // go through normal search event workflow
            this.mediator.trigger('search:initiated', model);
        }
    }

    onErrorResponse(errorXHR) {
        if (errorXHR.statusText !== 'abort') {
            this.reset();
            this.mediator.trigger('search:error');
        }
    }

    onNoResults() {
        this.mediator?.trigger('search:facetsReturned');
    }

    countCaps(str) {
        return str.replace(/[^A-Z]/g, '').length;
    }

    countFacetValues(facets) {
        let numValues = 0;

        _.each(facets, function(facet) {
            _.each(facet.values, function(value) {
                numValues += parseInt(value.count, 10);
            }, this);
        }, this);

        return numValues;
    }

}

export default FacetsCollection;
