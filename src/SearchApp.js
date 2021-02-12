/* jshint esversion: 6 */

import * as Backbone from 'backbone';
import _ from 'underscore';
import * as config from './config/appConfig';
import BaseView from './views/BaseView';
import {fromEncodedString} from './lib/SearchTerms';
import FacetsCollection from './collections/FacetsCollection';
import OpenSearchProvider from './lib/OpenSearchProvider';
import SearchParamsModel from './models/SearchParamsModel';
import SearchResultsCollection from './collections/SearchResultsCollection';
// import criteriaAppender from './lib/criteriaAppender';

class SearchApp extends Backbone.Router {
    preinitialize() {
        this.routes = {
            '': 'index',
            '*path': 'doRoute'
        };
    }

    initialize(params) {
        // TODO take environment into account for some config properties?
        // example from SOAC:
        // if(process.env.APPLICATION_ENVIRONMENT === 'development') {
        //     this.urlConfig = config.urls.development;
        // }
        // else {
        //     this.urlConfig = config.urls.production;
        // }
        this.config = config.appConfig;

        // TODO retrofit object factory stuff?
        // bootstrap the object factory
        // objectFactory.setConfig(iocConfig);
        this.openSearchOptions = this.config.openSearchOptions;
        this.displayHomePageOnCancel = true;

        // Property names are a regular expression string,
        //
        // Values need to exist as attributes on the SearchParamsModel and
        // SearchResultsCollection, with the latter needing getXXX methods for
        // each.
        this.properties = {
            keywords: 'keywords=(.*)',
            author: 'author=(.*)',
            title: 'title=(.*)',
            sensor: 'sensor=(.*)',
            parameter: 'parameter=(.*)',
            startDate: 'startDate=(.*)',
            endDate: 'endDate=(.*)',
            sortKeys: 'sortKeys=(.*)',
            facetFilters: 'facetFilters=(.*)',
            pageNumber: 'pageNumber=(\\d+)',
            osGeoBbox: 'osGeoBbox=(.*)',
            itemsPerPage: 'itemsPerPage=(\\d+)',

            // deprecated properties
            p: 'p=(\\d+)',
            bbox: 'bbox=(.*)',
            psize: 'psize=(\\d+)'
        };

        this.routeHandlerProperties = this.properties;
        this.mediator = _.extend({}, Backbone.Events);

        // Set up routing. Using this form instead of the object literal to make
        // it harder to change the routing table - right now any changes to the
        // routing should happen to the routeHandlerProperties object.
        //this.route('*path', 'doRoute');

        this.openSearchProvider = new OpenSearchProvider({ mediator: this.mediator });
        this.searchParamsModel = new SearchParamsModel({
            mediator: this.mediator,
            openSearchOptions: this.openSearchOptions
        });
        this.searchResults = new SearchResultsCollection({
            mediator: this.mediator,
            provider: this.openSearchProvider
        });
        this.facets = new FacetsCollection({
            mediator: this.mediator,
            provider: this.openSearchProvider
        });

        if(params.el === 'undefined') {
            throw new Error('el is a required parameter of the SearchApp');
        }
        this.el = params.el;

        // Register event handlers
        this.bindEvents(this.mediator);

        // Compiling regexes is expensive, and the operation is done over and over
        // again in the doRoute code. By memoizing, the expensive operation is only
        // done once, and it's returned from a cache each subsequent time a given
        // string is compiled to a RegExp.
        // Param: a regular expression string to compile to a RegExp
        // Returns: a RegExp object
        this.compileRegex = _.memoize(function (regexString) {
            return new RegExp(regexString);
        });

        // Initialize the view framework
        this.currentView = new BaseView({
            el: this.el,
            config: this.config,
            model: new SearchParamsModel({mediator: this.mediator}),
            mediator: this.mediator
        });
    }

    isItemsPerPageEnabled() {
        return this.config.features && this.config.features.itemsPerPage;
    }

    isHomePageEnabled() {
        return this.config.features && this.config.features.homePage;
    }

    bindEvents(mediator) {
        mediator.on('search:noResults', this.onSearchComplete, this);
        mediator.on('search:complete', this.onSearchComplete, this);
        mediator.on('search:cancel', this.onSearchCancel, this);
        mediator.on('app:home', this.onAppHome, this);
    }

    index() {
        // this.currentView = new HomeContentView({
        //     //baseView: this.baseView,
        //     el: this.el,
        //     mediator: this.mediator
        // });
        // TODO: Hide facets, etc.
        this.currentView.render();
        // Create an initial view and update the page
        // this.mainView = objectFactory.createInstance('MainView', {
        //     el: jQuery(params.el),
        //     searchResultsCollection: this.searchResults,
        //     facetsCollection: this.facets,
        //     searchParamsModel: this.searchParamsModel
        // }).render();

    }

    // put together a a query from the URL parameters.
    // Order of URL segments shouldn't matter.
    doRoute(path) {
        let searchOptions = {},
          facetFilters = {};
        searchOptions.pageNumber = 1;
        if(this.isItemsPerPageEnabled()) {
            searchOptions.itemsPerPage = this.openSearchOptions.osItemsPerPage;
        }

        if((path === null || path === '') && this.isHomePageEnabled()) {
            this.mediator.trigger('app:home');
            return;
        }

        _.each(path.split('/'), function (pathComponent) {
            let propName = pathComponent.split('=')[0],
              propValue,
              matches,
              re;

            // discard properties given in the URL not known to the app
            if(!this.routeHandlerProperties.hasOwnProperty(propName)) {
                return;
            }

            re = this.compileRegex(this.properties[propName]);
            matches = pathComponent.match(re);
            propValue = matches[1];

            if(propName === 'facetFilters') {
                facetFilters = JSON.parse(decodeURIComponent(propValue));
            }
            else if(_.contains(['keywords', 'author', 'title', 'sensor', 'parameter', 'sortKeys'], propName)) {
                searchOptions[propName] = fromEncodedString(decodeURI(propValue)).asArray();
            }
            else {
                searchOptions[propName] = propValue;
            }

        }, this);

        this.searchParamsModel.setCriteria(searchOptions);
        this.mediator.trigger('search:urlParams', this.searchParamsModel, facetFilters);

    }

    onSearchCancel() {
        if(this.displayHomePageOnCancel && this.isHomePageEnabled()) {
            this.mediator.trigger('app:home');
        }
        else {
            this.mediator.trigger('search:displayPreviousResults');
        }
    }

    onSearchComplete() {
        this.displayHomePageOnCancel = false;
        this.addCurrentUrlToNavigationHistory();
    }

    onAppHome() {
        this.displayHomePageOnCancel = true;
        this.navigate('/', {replace: true});
    }

    addCurrentUrlToNavigationHistory() {
        const url = 'blah/blah/blah';
        //var url = criteriaAppender.generateUrl(this.routeHandlerProperties, this.searchResults);
        this.navigate(url);
    }
}

export default SearchApp;

