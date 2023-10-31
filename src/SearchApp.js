import * as Backbone from 'backbone';
import _ from 'underscore';

import { appConfig, appRouteHandlerProperties, openSearchOptions, environmentUrls } from './config/appConfig';
import BaseView from './views/BaseView';
import { decodedQueryParameter } from './lib/utility_functions';
import FacetsCollection from './collections/FacetsCollection';
import Mediator from "./lib/Mediator";
import OpenSearchProvider from './lib/OpenSearchProvider';
import SearchParamsModel from './models/SearchParamsModel';
import SearchResultsCollection from './collections/SearchResultsCollection';
import SearchTerms from './lib/SearchTerms';
import * as criteriaAppender from './lib/criteriaAppender';

class SearchApp extends Backbone.Router {
    preinitialize() {
        // Set up routing. Using this form instead of the object literal to make
        // it harder to change the routing table - right now any changes to the
        // routing should happen to the routeHandlerProperties object.
        this.routes = {
            '*path': 'doRoute'
        };

        // Intercept the callback to check for Drupal variable or query parameters
        this.execute = function(callback, args, name) {
            // If no drupal context, set it to empty so the below checks will work
            if (window['drupalSettings'] === void 0) {
                window['drupalSettings'] = {};
            }

            // If a Drupal variable is set (presumed to be a string or strings representing
            // text search input from a search field anywhere on the web site), use that
            // for search input.
            // NOTE! This code has not been tested in the real Drupal world!
            if (name === 'doRoute' && window['drupalSettings'].keywords) {
                args[0] = 'keywords=' + window['drupalSettings'].keywords;
            }

            if (callback) callback.apply(this, args);
        }
    }

    initialize(params) {
        this.config = appConfig;
        this.openSearchOptions = openSearchOptions;
        this.version = process.env.VERSION.replace(/"/g, '');

        // Endpoints depend on environment
        let envUrls = environmentUrls(process.env.APPLICATION_ENVIRONMENT);
        this.openSearchOptions.osProvider = envUrls;
        this.config.temporalCoverageView.provider = envUrls;

        this.routeHandlerProperties = appRouteHandlerProperties;
        this.mediator = new Mediator();

        _.extend(OpenSearchProvider.prototype, this.mediator);
        this.openSearchProvider = new OpenSearchProvider({
        });

        // TODO
        // This appears to be bootstrapping a model instance, rather than
        // letting the SearchResultsCollection handle model creation
        // (compare to FacetsCollection). My guess is that the collection
        // should be handling some of the functionality currently dealt with
        // in the model. (JAC 2021-03-02)
        this.searchParamsModel = new SearchParamsModel({
            mediator: this.mediator,
            openSearchOptions: this.openSearchOptions
        });
        this.searchResultsCollection = new SearchResultsCollection(null, {
            mediator: this.mediator,
            provider: this.openSearchProvider,
            osDefaultParameters: this.openSearchOptions
        });
        this.facetsCollection = new FacetsCollection(null, {
            config: this.config,
            mediator: this.mediator,
            provider: this.openSearchProvider,
            osDefaultParameters: this.openSearchOptions
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
        this.homeView = new BaseView({
            el: this.el,
            version: this.version,
            config: this.config,
            searchParamsModel: this.searchParamsModel,
            searchResultsCollection: this.searchResultsCollection,
            facetsCollection: this.facetsCollection,
            mediator: this.mediator,
            osProvider: this.openSearchOptions.osProvider
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

    // put together a query from the URL parameters.
    // Order of URL segments shouldn't matter.
    doRoute(path) {
        let searchOptions = {},
            facetFilters = {};

        searchOptions.pageNumber = 1;
        if(this.isItemsPerPageEnabled()) {
            searchOptions.itemsPerPage = this.openSearchOptions.osItemsPerPage;
        }

        // Always render the HTML content when loading or reloading the page.
        this.homeView.render();

        // If no search criteria are available, add empty keywords to force a default search.
        if (path === null) {
            path = 'keywords=';
        }

        _.each(path.split('/'), function (pathComponent) {
            let propName = pathComponent.split('=')[0],
                propValue,
                matches,
                re;

            // discard properties given in the URL not known to the app
            // TODO: eventually change this to, once Safari, etc, implement hasOwn properly, and remove hasOwnProperty lines
            // if(!Object.hasOwn(this.routeHandlerProperties, propName)) {
            /* eslint-disable no-prototype-builtins */
            if(!this.routeHandlerProperties.hasOwnProperty(propName)) {
            /* eslint-enable no-prototype-builtins */
                return;
            }

            re = this.compileRegex(this.routeHandlerProperties[propName]);
            matches = pathComponent.match(re);
            propValue = matches[1];

            if(propName === 'facetFilters') {
                facetFilters = JSON.parse(decodeURIComponent(propValue));
            }
            else if(_.contains(['keywords', 'author', 'title', 'sensor', 'parameter'], propName)) {
                let decodedPropValue = decodedQueryParameter(decodeURI(propValue));
                searchOptions[propName] = new SearchTerms(decodedPropValue).asArray();
            }
            else {
                searchOptions[propName] = propValue;
            }

        }, this);

        this.searchParamsModel.setCriteria(searchOptions);
        this.mediator.trigger('search:urlParams', this.searchParamsModel, facetFilters);
    }

    onSearchCancel() {
        this.mediator.trigger('search:displayPreviousResults');
    }

    onSearchComplete() {
        this.addCurrentUrlToNavigationHistory();
    }

    onAppHome() {
        this.navigate('/', {trigger: true});
    }

    addCurrentUrlToNavigationHistory() {
        let url = criteriaAppender.generateUrl(this.routeHandlerProperties, this.searchResultsCollection);
        this.navigate(url);
    }
}

export default SearchApp;
