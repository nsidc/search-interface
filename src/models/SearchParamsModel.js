/* jshint esversion: 6 */

import * as Backbone from 'backbone';
import _ from 'underscore';
import { openSearchOptions } from '../config/appConfig';
import * as utilityFunctions from '../lib/utility_functions';

class SearchParamsModel extends Backbone.Model {
    initialize(options) {
        this.mediator = options.mediator;
        this.openSearchOptions = openSearchOptions;
        this.setParamsFromDefaults();
        this.bindEvents();
    }

    // TODO: Is this method duplicated in utilityFunctions?
    // Ensures the input is convertible to an integer greater than 1, and throws
    // errors if it's not.
    // Returns an integer greater than zero
    sanitizePageNumber(input) {
        input = utilityFunctions.toNumber(input, 'int',
                           'Requested page number must be a number');

        if(input < 1) {
            throw new Error('Requested page number must be greater than 0');
        }

        return input;
    }

    getMutatorName(propertyName) {
        return 'set' + utilityFunctions.toInitialCaps(propertyName);
    }

    bindEvents() {
        this.mediator.on('model:toggleFacet', this.toggleFacet, this);
        this.mediator.on('model:clearFacet', this.clearFacet, this);
        this.mediator.on('app:home', this.onAppHome, this);
    }

    onAppHome() {
        this.resetCriteria();
        this.resetFacetFilters();
    }

    toggleFacet(facet, name) {
        let index, facetFilters = $.extend(true, {}, this.get('facetFilters'));

        if(facet in facetFilters) {
            index = facetFilters[facet].indexOf(name);

            if(index > -1) {
                facetFilters[facet].splice(index, 1);
                if(facetFilters[facet].length === 0) {
                    delete facetFilters[facet];
                }
            }
            else {
                facetFilters[facet].push(name);
            }
        }
        else {
            facetFilters[facet] = [name];
        }

        this.set('facetFilters', facetFilters);
        this.set('pageNumber', 1);
        this.mediatorTrigger('search:refinedSearch', this);
    }

    clearFacet(facet) {
        let facetFilters = $.extend(true, {}, this.get('facetFilters'));
        if(facet in facetFilters) {
            delete facetFilters[facet];
            this.set('facetFilters', facetFilters);
            this.mediatorTrigger('search:refinedSearch', this);
        }
    }

    setParamsFromDefaults() {
        this.set('pageNumber', 1);
        this.set('itemsPerPage', this.openSearchOptions.osItemsPerPage);
        this.resetKeywords();
        this.resetAuthors();
        this.resetParameters();
        this.resetSensors();
        this.resetTitles();
        this.resetSpatialCoverage();
        this.resetTemporalCoverage();
        this.resetFacetFilters();
        this.resetSortKeys();
    }

    isSetToDefaults() {
        return ((this.get('keyword') === this.openSearchOptions.osSearchTerms) &&
            (this.get('startDate') === this.openSearchOptions.osDtStart) &&
            (this.get('endDate') === this.openSearchOptions.osDtEnd) &&
            (this.get('geoBoundingBox') === this.openSearchOptions.osGeoBbox));
    }

    setPageNumber(input, backboneOptions) {
        let intPageVal;
        if(input === undefined) {
            intPageVal = 1;
        }
        else {
            intPageVal = this.sanitizePageNumber(input);
        }

        this.set('pageNumber', intPageVal, backboneOptions);
    }

    setItemsPerPage(input, backboneOptions) {
        let intItemsPerPage, newPage, firstResultPos;
        if(input === undefined) {
            intItemsPerPage = this.openSearchOptions.osItemsPerPage;
        }
        else {
            intItemsPerPage = parseInt(input, 10);
        }

        if(typeof (this.get('itemsPerPage')) !== 'undefined') {
            firstResultPos = this.get('itemsPerPage') * (this.get('pageNumber') - 1);
            newPage = Math.floor(firstResultPos / intItemsPerPage) + 1;
            this.setPageNumber(newPage);
        }

        this.set('itemsPerPage', intItemsPerPage, backboneOptions);
    }

    setKeyword(keywords, backboneOptions) {
        this.setKeywordAndConstraint('keyword', keywords, backboneOptions);
    }

    setAuthor(keywords, backboneOptions) {
        this.setKeywordAndConstraint('author', keywords, backboneOptions);
    }

    setParameter(keywords, backboneOptions) {
        this.setKeywordAndConstraint('parameter', keywords, backboneOptions);
    }

    setSensor(keywords, backboneOptions) {
        this.setKeywordAndConstraint('sensor', keywords, backboneOptions);
    }

    setTitle(keywords, backboneOptions) {
        this.setKeywordAndConstraint('title', keywords, backboneOptions);
    }

    setFacetFilters(obj, backboneOptions) {
        this.set('facetFilters', obj, backboneOptions);
    }

    setKeywordAndConstraint(searchParam, keywords, backboneOptions) {
        if(keywords instanceof Array !== true) {
            throw new TypeError('Keywords must be an array');
        }
        this.set(searchParam, keywords, backboneOptions);
    }

    setStartDate(startDate, backboneOptions) {
        this.set('startDate', startDate, backboneOptions);
    }

    setEndDate(endDate, backboneOptions) {
        this.set('endDate', endDate, backboneOptions);
    }

    setSortKeys(sortKeys, backboneOptions) {
      this.set('sortKeys', sortKeys, backboneOptions);
    }

    // this model's geoBoundingBox is a string formatted for opensearch: $W,$S,$E,$N
    setGeoBoundingBox(geoBoundingBox, backboneOptions) {
      if(geoBoundingBox === '' || geoBoundingBox === undefined) {
        geoBoundingBox = this.openSearchOptions.osGeoBbox;
      }

      this.set('geoBoundingBox', geoBoundingBox, backboneOptions);
    }

    // set the model's box using the 'identifier' string form: N:$N,S:$S,E:$E,W:$W
    setOsGeoBbox(geoBBAsURLPart, backboneOptions) {
      var bbox = utilityFunctions.osGeoBoxFromIdentifier(geoBBAsURLPart);
      this.setGeoBoundingBox(bbox, backboneOptions);
    }

    setCriteria(criteria) {

      // reset any data the model may have
      this.resetCriteria();

      _.each(criteria, function (value, propertyName) {
        var mutatorFn = this[this.getMutatorName(propertyName)];

        if(mutatorFn !== undefined && typeof mutatorFn === 'function') {
          mutatorFn.call(this, value);
        }
        else {
          throw new Error('The parameter ' + propertyName + ' is not known.');
        }
      }, this);

      return this;
    }

    removeSearchTerm(term) {
      var searchTermFields = ['keyword', 'author', 'parameter', 'sensor', 'title'];

      _.each(searchTermFields, function (field) {
        var terms = this.get(field);

        terms = typeof terms === 'string' ? [terms] : terms;

        if(terms) {
          terms.splice(_.indexOf(terms, term), 1);

          this.unset(field);
          this.set(field, terms);
        }

      }, this);
    }

    resetKeywords() {
      this.set('keyword', this.openSearchOptions.osSearchTerms);
    }

    resetAuthors() {
      this.set('author', this.openSearchOptions.osAuthor);
    }

    resetParameters() {
      this.set('parameter', this.openSearchOptions.osParameter);
    }

    resetSensors() {
      this.set('sensor', this.openSearchOptions.osSensor);
    }

    resetTitles() {
      this.set('title', this.openSearchOptions.osTitle);
    }

    resetFacetFilters() {
      this.set('facetFilters', this.openSearchOptions.osFacetFilters);
    }

    resetSpatialCoverage() {
      this.set('geoBoundingBox', this.openSearchOptions.osGeoBbox);
    }

    resetTemporalCoverage() {
      this.set('startDate', this.openSearchOptions.osDtStart);
      this.set('endDate', this.openSearchOptions.osDtEnd);
    }

    resetSortKeys() {
        this.set('sortKeys', this.openSearchOptions.osSortKeys);
    }

    resetCriteria() {
        // TODO: Is "unset" necessary?
        // this.unset('keyword');
        // this.unset('author');
        // this.unset('parameter');
        // this.unset('sensor');
        // this.unset('title');
        // this.unset('startDate');
        // this.unset('endDate');
        // this.unset('sortKeys');
        this.setParamsFromDefaults();
    }
}

export default SearchParamsModel;
