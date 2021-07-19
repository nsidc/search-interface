var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };

define(
  [
    'models/SearchParamsModel',
    'collections/SearchResultsCollection',
    'collections/FacetsCollection',
    'lib/AdeSearchApp',
    'lib/criteriaAppender',
    'lib/objectFactory',
    'lib/Mediator',
    'lib/OpenSearchProvider'
  ],
  function (
            SearchParamsModel,
            SearchResultsCollection,
            FacetsCollection,
            AdeSearchApp,
            criteriaAppender,
            objectFactory,
            Mediator,
            OpenSearchProvider) {

    var AdeMainViewInstance = createFakeView();
    var ResultItemView = sinon.stub().returns(createFakeView()),
      AdeMainView = sinon.stub().returns(AdeMainViewInstance),
      MainHeaderView = sinon.stub().returns(createFakeView());

    var ensureAdeMainViewWasRendered = function () {
      expect(AdeMainView).toHaveBeenCalledOnce();
      expect(AdeMainViewInstance.render).toHaveBeenCalledOnce();
    };

    describe('Ade Search App', function () {
      var createMinimalSearchApp,
        createMinimalNSIDCSearchApp,
        createMinimalAdeSearchApp,
        defaultConfig;

      beforeEach(function () {
        AdeMainViewInstance.render.resetHistory();
        AdeMainView.resetHistory();
      });

      defaultConfig = {
        features: {
          homePage: true
        },
        openSearch: {
          defaultParameters : {
            osGeoBbox: '-180,45,180,90',
            osItemsPerPage: 25
          }
        }
      };

      createMinimalSearchApp = function (appID) {
        objectFactory.setConfig({
            'AdeMainView': {Ctor: AdeMainView},
            'ResultItemView': {Ctor: ResultItemView},
            'MainHeaderView': {Ctor: MainHeaderView, defaultOptions: {templateId: '#nsidc_search-MainHeaderView-panel' } },
            'SearchParamsModel': {
              Ctor: SearchParamsModel,
              configOptions: {
                defaultOptions: {
                  keyword: '',
                  startDate: '',
                  endDate: '',
                  osGeoBbox: '-180.0,-90.0,180.0,90.0',
                  osGeoBboxDisplay: 'N:90.0, S:-90.0, E:180.0, W:-180.0'
                }
              }
            },
            'SearchResultsCollection': {
              Ctor: SearchResultsCollection,
              configOptions: {
                preset: {
                  osDefaultParameters: {
                    osdd: '/api/gi-cat/services/opensearchesip?getDescriptionDocument',
                    osStartIndex: 0,
                    osItemsPerPage: 25,
                    osSearchTerms: '',
                    osGeoBbox: {latMax: 90, lonMax: 180, latMin: 45, lonMin: -180},
                    osGeoRel: 'overlaps',
                    osDtStart: '',
                    osDtEnd: ''
                  }
                }
              },
              models: {}
            },
            'FacetsCollection': {
              Ctor: FacetsCollection,
              configOptions: {
                preset: {
                  osDefaultParameters: {
                    osdd: '/api/gi-cat/services/opensearchesip?getDescriptionDocument',
                    osStartIndex: 0,
                    osItemsPerPage: 25,
                    osSearchTerms: '',
                    osGeoBbox: {latMax: 90, lonMax: 180, latMin: 45, lonMin: -180},
                    osGeoRel: 'overlaps',
                    osDtStart: '',
                    osDtEnd: ''
                  }
                }
              },
              models: {}
            },
            'OpenSearchProvider': OpenSearchProvider
          });

        var app, params, appConfig;
        params = {
          mediator: sinon.stub(new Mediator()),
          el: document.createElement('div')
        };
        appConfig = {
          features: {
            homePage: true,
            itemsPerPage: appID === 'ADE' ? [10, 25, 50, 100] : [25, 50, 100, 250, 500],
            facets: true
          },
          openSearch: {
            defaultParameters : {
              osGeoBbox: '-180,45,180,90',
              osItemsPerPage: 25
            }
          }
        };
        app = new AdeSearchApp(params, appConfig);

        return app;
      };

      createMinimalAdeSearchApp = function () {
        return  createMinimalSearchApp('ADE');
      };

      createMinimalNSIDCSearchApp = function () {
        return createMinimalSearchApp('NSIDC');
      };

      describe('NSIDC custom URL routing', function () {
        var app, searchParamsSpy;

        beforeEach(function () {
          // Set up minimal search app and spy on the searchParamsModel's setCriteria
          app = createMinimalNSIDCSearchApp();
          searchParamsSpy = sinon.spy(app.getSearchParamsModel(), 'setCriteria');
        });


        // TODO [ML, 2013-06-24]: this need to be updated for homepage disabled
        xit('should trigger an "app:home" event when the URL has no parameters', function () {
          var mediator = sinon.stub(new Mediator());
          app.setMediator(mediator);
          app.doRoute('');
          expect(mediator.trigger).toHaveBeenCalledWith('app:home');
        });

        xit('should not trigger a "search:initiated" event when we are in the base URL', function () {
          var mediator = sinon.stub(new Mediator());
          app.setMediator(mediator);
          app.doRoute('');
          expect(mediator.trigger).not.toHaveBeenCalledWith('search:initiated');
        });

        xit('should have a default route that does nothing', function () {
          app.doRoute('');
          expect(searchParamsSpy).not.toHaveBeenCalled();
        });

        it('should route urls that specify page numbers', function () {
          var args;

          app.doRoute('pageNumber=3');
          args = searchParamsSpy.getCall(0)[0];

          expect(args.pageNumber).toBe('3');
        });

        it('should route urls that specify items number per page', function () {
          var args;

          app.doRoute('itemsPerPage=100');
          args = searchParamsSpy.getCall(0)[0];

          expect(args.itemsPerPage).toBe('100');
        });
      });

      describe('startup sequence', function () {

        it('Should correctly set up the application', function () {
          var adeSearchApp = createMinimalAdeSearchApp();
          expect(adeSearchApp.getSearchResultsCollection()).toBeDefined();
        });

        it('should create and render an AdeMainView', function () {
          createMinimalAdeSearchApp();
          ensureAdeMainViewWasRendered();
        });

      });


      describe('ADE custom URL routing', function () {

        var app, searchParamsSpy, triggerSpy;

        beforeEach(function () {
          // Set up minimal search app and spy on the searchParamsModel's setCriteria
          app = createMinimalAdeSearchApp();
          searchParamsSpy = sinon.spy(app.getSearchParamsModel(), 'setCriteria');
          triggerSpy = sinon.spy(app, 'mediatorTrigger');
        });

        it('should trigger an "app:home" event when the URL has no parameters', function () {
          var mediator = sinon.stub(new Mediator());
          app.setMediator(mediator);
          app.doRoute('');
          expect(mediator.trigger).toHaveBeenCalledWith('app:home');
        });

        it('should not trigger a "search:initiated" event when we are in the base URL', function () {
          var mediator = sinon.stub(new Mediator());
          app.setMediator(mediator);
          app.doRoute('');
          expect(mediator.trigger).not.toHaveBeenCalledWith('search:initiated');
        });

        it('should have a default route that does nothing', function () {
          app.doRoute('');
          expect(searchParamsSpy).not.toHaveBeenCalled();
        });

        it('should route urls that specify page numbers', function () {
          var args;

          app.doRoute('p=3');
          args = searchParamsSpy.getCall(0)[0];

          expect(args.p).toBe('3');
        });

        it('should route urls that specify items number per page', function () {
          var args;

          app.doRoute('itemsPerPage=100');
          args = searchParamsSpy.getCall(0)[0];

          expect(args.itemsPerPage).toBe('100');
        });

        it('should route urls that specify keywords', function () {
          app.doRoute('keywords=ice');
          expect(searchParamsSpy).toHaveBeenCalledWith({
            keywords: ['ice'],
            pageNumber: 1,
            itemsPerPage: defaultConfig.openSearch.defaultParameters.osItemsPerPage
          });
        });

        it('should properly decode the double-encoded keywords params so that they can contain forward slashes', function () {
          app.doRoute('keywords=ssm%252Fi');
          expect(searchParamsSpy).toHaveBeenCalledWith({
            keywords: ['ssm/i'],
            pageNumber: 1,
            itemsPerPage: defaultConfig.openSearch.defaultParameters.osItemsPerPage
          });
        });

        it('should route urls that specify a start date', function () {
          app.doRoute('startDate=2001-04-01');
          expect(searchParamsSpy).toHaveBeenCalledWith({startDate: '2001-04-01', pageNumber: 1,
                                                       itemsPerPage: defaultConfig.openSearch.defaultParameters.osItemsPerPage});
        });

        it('should route urls that specify an end date', function () {
          app.doRoute('endDate=2010-11-05');
          expect(searchParamsSpy).toHaveBeenCalledWith({endDate: '2010-11-05', pageNumber: 1,
                                                       itemsPerPage: defaultConfig.openSearch.defaultParameters.osItemsPerPage});
        });

        it('should route urls that specify a bounding box', function () {
          var urlPart = 'N:90,S:-80,E:120,W:-150';
          // geo:box ~ west, south, east, north
          app.doRoute('osGeoBbox=' + urlPart);
          expect(searchParamsSpy).toHaveBeenCalledWith({
            osGeoBbox: urlPart,
            pageNumber: 1,
            itemsPerPage: defaultConfig.openSearch.defaultParameters.osItemsPerPage
          });
        });

        it('should route urls with page numbers and keywords and osGeoBbox', function () {
          var urlPart = 'N:90,S:-80,E:120,W:-150',
              args;
          app.doRoute('keywords=snow/pageNumber=5/osGeoBbox=' + urlPart);

          // Pagenumber is set by default at beginning of call and is always last in the calledWith
          args = searchParamsSpy.getCall(0)[0];

          expect(args.keywords).toEqual(['snow']);
          expect(args.osGeoBbox).toBe(urlPart);
          expect(args.pageNumber).toBe('5');
          expect(args.itemsPerPage).toBe(defaultConfig.openSearch.defaultParameters.osItemsPerPage);
        });

        it('should route urls with facet filters', function () {
          var facetFilters = { facet_data_center: [ 'NSIDC' ] },
              encodedFacetFilters = encodeURI(JSON.stringify(facetFilters));

          app.doRoute('facetFilters=' + encodedFacetFilters);

          expect(triggerSpy).toHaveBeenCalledWith('search:urlParams');
          expect(triggerSpy.getCall(0)[2]).toEqual({ facet_data_center: [ 'NSIDC' ] });
        });

        it('should route urls independent of the segment order', function () {
          var args;

          app.doRoute('pageNumber=6/keywords=frogs');

          args = searchParamsSpy.getCall(0)[0];

          expect(args.keywords).toEqual(['frogs']);
          expect(args.pageNumber).toBe('6');
          expect(args.itemsPerPage).toBe(defaultConfig.openSearch.defaultParameters.osItemsPerPage);
        });

      });


      describe('the route handling', function () {
        it('should have a corresponding accessor in SearchResultsCollection for each value in the routeHandlerProperties obj', function () {
          // This is more of a static test to make sure that the
          // routeHandlerProperties values are all valid (i.e. that they have a
          // corresponding accessor function in SearchResultsCollection).  Since
          // this relationship isn't enforced by code anywhere, this test provides
          // some kind of insurance.

          var app = createMinimalAdeSearchApp(),
              searchResultsCollection = app.getSearchResultsCollection();

          _.each(app.routeHandlerProperties, function (regex, propName) {
            var expectedMethodName = criteriaAppender.getAccessorName(propName);
            if (typeof searchResultsCollection[expectedMethodName] !== 'function') {
              // The expectation is written to expose the failure in the
              // logs as obviously as possible - the toEqual(true) is not
              // really significant.
              expect('SearchResultsCollection should have a ' + expectedMethodName + ' method').toEqual(true);
            }
          });
        });
      });

      describe('pushing urls into the url history', function () {
        var app, mediator;

        beforeEach(function () {
          mediator = new Mediator();
          app = createMinimalAdeSearchApp();
          app.setMediator(mediator);
        });

        it('adds a url state when a new set of results is received by the resultsCollection', function () {
          sinon.stub(app, 'addCurrentUrlToNavigationHistory');

          mediator.trigger('search:complete');

          expect(app.addCurrentUrlToNavigationHistory.mock.calls.length).toEqual(1);

          app.addCurrentUrlToNavigationHistory.restore();
        });

        it('adds a url state when an empty set of results is received by the resultsCollection', function () {
          sinon.stub(app, 'addCurrentUrlToNavigationHistory');

          mediator.trigger('search:noResults');

          expect(app.addCurrentUrlToNavigationHistory.mock.calls.length).toEqual(1);

          app.addCurrentUrlToNavigationHistory.restore();
        });

        it('uses the page number from the results collection', function () {
          sinon.stub(app, 'navigate');  // this is a Backbone.Router method
          sinon.stub(app.searchResults, 'getPageNumber').returns(7);
          sinon.stub(app.searchResults, 'getOsGeoBbox').returns('N:90,S:45,E:180,W:-180');

          mediator.trigger('search:complete');

          expect(app.navigate.mock.calls.length).toEqual(1);
          expect(app.navigate.firstCall[0]).toContain('pageNumber=7');

          app.searchResults.getPageNumber.restore();
        });

        it('uses the keywords from the results collection', function () {
          sinon.stub(app, 'navigate');
          sinon.stub(app.searchResults, 'getPageNumber').returns(1);
          sinon.stub(app.searchResults, 'getKeyword').returns(['ice']);
          sinon.stub(app.searchResults, 'getOsGeoBbox').returns('N:90,S:45,E:180,W:-180');

          mediator.trigger('search:complete');

          expect(app.navigate.mock.calls.length).toEqual(1);
          expect(app.navigate.firstCall[0]).toContain('keywords=ice');

          app.searchResults.getPageNumber.restore();
          app.searchResults.getKeyword.restore();
        });

        it('uses the page number, keywords and bbox from the results collection', function () {
          sinon.stub(app, 'navigate');
          sinon.stub(app.searchResults, 'getPageNumber').returns(5);
          sinon.stub(app.searchResults, 'getKeyword').returns(['ice']);
          sinon.stub(app.searchResults, 'getOsGeoBbox').returns('N:90,S:-80,E:120,W:-150');

          mediator.trigger('search:complete');

          expect(app.navigate.mock.calls.length).toEqual(1);
          expect(app.navigate.firstCall[0]).toContain('pageNumber=5');
          expect(app.navigate.firstCall[0]).toContain('keywords=ice');
          expect(app.navigate.firstCall[0]).toContain('osGeoBbox=N:90,S:-80,E:120,W:-150');

          app.searchResults.getPageNumber.restore();
          app.searchResults.getKeyword.restore();
        });

        it('does not put unused parameters into the URL string', function () {
          sinon.stub(app, 'navigate');
          sinon.stub(app.searchResults, 'getPageNumber').returns(9);
          sinon.stub(app.searchResults, 'getOsGeoBbox').returns('N:90,S:45,E:180,W:-180');
          sinon.stub(app.searchResults, 'getStartDate').returns('start');

          mediator.trigger('search:complete');

          expect(app.navigate.mock.calls.length).toEqual(1);
          expect(app.navigate.firstCall[0]).not.toContain('keywords');
          expect(app.navigate.firstCall[0]).not.toContain('endDate');
        });
      });

      describe('mediated event handling', function () {
        var app, mediator;

        beforeEach(function () {
          mediator = new Mediator();
          app = createMinimalAdeSearchApp();
          app.setMediator(mediator);
        });

        it('is bound to the search:cancel event', function () {
          sinon.stub(app, 'onSearchCancel');
          app.bindEvents();

          mediator.trigger('search:cancel');
          expect(app.onSearchCancel).toHaveBeenCalled();
        });

        it('resets the URL when the app:home event is triggered', function () {
          sinon.stub(app, 'onAppHome');
          app.bindEvents();

          mediator.trigger('app:home');
          expect(Backbone.history.getFragment()).toBe('');
        });

        describe('handling a canceled search', function () {
          beforeEach(function () {
            mediator = sinon.stub(new Mediator());
            app.setMediator(mediator);
          });

          it('triggers app:home if no previous searches have been completed', function () {
            app.onSearchCancel();
            expect(mediator.trigger).toHaveBeenCalledWith('app:home');
          });

          it('triggers search:displayPreviousResults if any previous searches have been completed', function () {
            sinon.stub(app.searchResults, 'getOsGeoBbox').returns('N:90,S:45,E:180,W:-180');
            app.onSearchComplete();
            app.onSearchCancel();
            expect(mediator.trigger).toHaveBeenCalledWith('search:displayPreviousResults');
          });

          it('triggers app:home if no searches have been completed since the last app:home trigger', function () {
            sinon.stub(app.searchResults, 'getOsGeoBbox').returns('N:90,S:45,E:180,W:-180');
            app.onSearchComplete();
            app.onAppHome();
            app.onSearchCancel();
            expect(mediator.trigger).toHaveBeenCalledWith('app:home');
          });

        });

      });

    });
  });
