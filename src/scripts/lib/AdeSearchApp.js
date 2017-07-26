define(['lib/SearchTerms',
       'lib/criteriaAppender',
       'lib/mediator_mixin',
       'views/AdeMainView',
       'lib/objectFactory'],
       function (SearchTerms,
                 criteriaAppender,
                 mediatorMixin,
                 AdeMainView,
                 objectFactory) {
  var AdeSearchApp, properties, compileRegex, displayHomePageOnCancel,
      isHomePageEnabled, isItemsPerPageEnabled, config, ws, message, loc;

  // Property names are a regular expression string,
  //
  // Values need to exist as attributes on the SearchParamsModel and
  // SearchResultsCollection, with the latter needing getXXX methods for
  // each.
  properties = {
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

  // Compiling regexes is expensive, and the operation is done over and over
  // again in the doRoute code. By memoizing, the expensive operation is only
  // done once, and it's returned from a cache each subsequent time a given
  // string is compiled to a RegExp.
  // Param: a regular expression string to compile to a RegExp
  // Returns: a RegExp object
  compileRegex = _.memoize(function (regexString) {
    return new RegExp(regexString);
  });

  isHomePageEnabled = function () {
    return config.features && config.features.homePage;
  };

  isItemsPerPageEnabled = function () {
    return config.features && config.features.itemsPerPage;
  };

  AdeSearchApp = Backbone.Router.extend({

    initialize: function (params, appConfig) {
      config = appConfig;
      this.config = appConfig;

      this.routeHandlerProperties = properties;

      if (params.mediator) {
        this.setMediator(params.mediator);
      }

      // Set up routing. Using this form instead of the object literal to make
      // it harder to change the routing table - right now any changes to the
      // routing should happen to the routeHandlerProperties object.
      this.route('*path', 'doRoute');

      this.openSearchProvider = objectFactory.createInstance('OpenSearchProvider');
      this.searchParamsModel = objectFactory.createInstance('SearchParamsModel');
      this.searchResults = objectFactory.createInstance('SearchResultsCollection', { provider: this.openSearchProvider });
      this.facets = objectFactory.createInstance('FacetsCollection', { provider: this.openSearchProvider });

      if (config.features.crazyEggMetrics) {
        window.setTimeout(function() {
          var newScript = document.createElement('script'),
              firstScript = document.getElementsByTagName('script')[0],
              cloudfrontUrl = '//dnn506yrbagrg.cloudfront.net/pages/scripts/0013/2090.js?';

          newScript.src = document.location.protocol + cloudfrontUrl + Math.floor(new Date().getTime() / 3600000);
          newScript.async = true;
          newScript.type = 'text/javascript';
          firstScript.parentNode.insertBefore(newScript, firstScript);
        }, 1);
      }

      if (params.el === 'undefined') {
        throw new Error('el is a required parameter of the AdeSearchApp');
      }

      displayHomePageOnCancel = true;

      // Register event handlers
      this.bindEvents();

      // Create an initial view and update the page
      this.adeMainView = new AdeMainView({
        el: jQuery(params.el),
        searchResultsCollection: this.searchResults,
        facetsCollection: this.facets,
        searchParamsModel: this.searchParamsModel
      }).render();

      // At this point the app is initialized, so start the Backbone.history object
      if (Backbone.history.options === undefined) {
        Backbone.history.start();
      }
    },

    bindEvents: function () {
      var parent = this;
      this.mediatorBind('search:noResults', this.onSearchComplete, this);
      this.mediatorBind('search:complete', this.onSearchComplete, this);
      this.mediatorBind('search:cancel', this.onSearchCancel, this);
      this.mediatorBind('app:home', this.onAppHome, this);
    },

    // put together a a query from the URL parameters.
    // Order of URL segments shouldn't matter.
    doRoute: function (path) {
      var searchOptions = {},
          facetFilters = {};
      searchOptions.pageNumber = 1;
      if (isItemsPerPageEnabled()) {
        searchOptions.itemsPerPage = config.openSearch.defaultParameters.osItemsPerPage;
      }

      if ((path === null || path === '') && isHomePageEnabled()) {
        this.mediatorTrigger('app:home');
        return;
      }

      _.each(path.split('/'), function (pathComponent) {
        var propName = pathComponent.split('=')[0],
            propValue,
            matches,
            re;

        // discard properties given in the URL not known to the app
        if (!this.routeHandlerProperties.hasOwnProperty(propName)) {
          return;
        }

        re = compileRegex(properties[propName]);
        matches = pathComponent.match(re);
        propValue = matches[1];

        if (propName === 'facetFilters') {
          facetFilters = JSON.parse(decodeURIComponent(propValue));
        } else if (_.contains(['keywords', 'author', 'title', 'sensor', 'parameter', 'sortKeys'], propName)) {
          searchOptions[propName] = SearchTerms.fromEncodedString(decodeURI(propValue)).asArray();
        } else {
          searchOptions[propName] = propValue;
        }

      }, this);

      this.searchParamsModel.setCriteria(searchOptions);
      this.mediatorTrigger('search:urlParams', this.searchParamsModel, facetFilters);

    },

    getSearchParamsModel : function () {
      return this.searchParamsModel;
    },

    getSearchResultsCollection : function () {
      return this.searchResults;
    },

    getMainView : function () {
      return this.adeMainView;
    },

    onSearchCancel : function () {
      if (displayHomePageOnCancel && isHomePageEnabled()) {
        this.mediatorTrigger('app:home');
      } else {
        this.mediatorTrigger('search:displayPreviousResults');
      }
    },

    onSearchComplete : function () {
      displayHomePageOnCancel = false;
      this.addCurrentUrlToNavigationHistory();
    },

    onAppHome : function () {
      displayHomePageOnCancel = true;
      this.navigate('/', {replace: true});
    },

    addCurrentUrlToNavigationHistory : function () {
      var url = criteriaAppender.generateUrl(this.routeHandlerProperties, this.searchResults);
      this.navigate(url);
    },

    setConfig: function (newConfig) {
      config = newConfig;
    },

    validateMessage: function (jsonMessage) {
      // For some reason ruby formats json using the old convention
      var message = JSON.parse(jsonMessage.replace(/\=>/g, ':'));
      if (message.target && message.title && message.content && message.target === config.features.wsHostApp) {
        return message;
      } else {
        return undefined;
      }
    }
  });

  // Mix in the mediator behaviour
  _.extend(AdeSearchApp.prototype, mediatorMixin);

  return AdeSearchApp;
});
