var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };
var createFakeModel = function () { return sinon.createStubInstance(Backbone.Model); };

requireMock.requireWithStubs(
  {
    'models/SearchParamsModel': sinon.stub().returns(createFakeModel()),
    'views/MainHeaderView': sinon.stub().returns(createFakeView()),
    'views/left_column/LeftColumnView': sinon.stub().returns(createFakeView()),
    'views/right_column/RightColumnView': sinon.stub().returns(createFakeView()),
    'views/HomePageView': sinon.stub().returns(createFakeView()),
    'views/LoadingResultsView': sinon.stub().returns(createFakeView()),
    'views/SearchErrorView': sinon.stub().returns(createFakeView())
  },
  [
    'models/SearchParamsModel',
    'lib/objectFactory',
    'views/MainHeaderView',
    'views/left_column/LeftColumnView',
    'views/right_column/RightColumnView',
    'views/AcadisMainView',
    'views/HomePageView',
    'views/LoadingResultsView',
    'views/SearchErrorView',
    'lib/Mediator'
  ],
  function (SearchParamsModel,
            objectFactory,
            MainHeaderView,
            LeftColumnView,
            RightColumnView,
            AcadisMainView,
            HomePageView,
            LoadingResultsView,
            SearchErrorView,
            Mediator) {

    describe('Acadis Main View', function () {

      var el, params, acadisMainView, testConfig;

      beforeEach(function () {
        el = document.createElement('div');
        params = {
          el: el,
          searchResultsCollection: new Backbone.Collection(),
          facetsCollection: new Backbone.Collection(),
          searchParamsModel: new SearchParamsModel()
        };

        testConfig = {
          'MainHeaderView': {Ctor: MainHeaderView, defaultOptions: {templateId: '#nsidc_search-MainHeaderView-panel' } },
          'HomePageView' : {Ctor: HomePageView, defaultOptions: {templateId: 'ACADIS'} },
          'LeftColumnView' : {Ctor: LeftColumnView, defaultOptions: {templateId: 'ACADIS'} },
          'LoadingResultsView' : {Ctor: LoadingResultsView, defaultOptions: {templateId: 'ACADIS'} },
        };
        objectFactory.setConfig(testConfig);

        _([ RightColumnView, MainHeaderView, LeftColumnView
          ]).each(function (ViewCtor) {
            ViewCtor.reset();
          });

          // No need to actually emit any debugger messages
        sinon.stub(debug, 'warn');
      });

      afterEach(function () {
        debug.warn.restore();
      });

      it('Should create the correct child elements', function () {
        // arrange
        acadisMainView = new AcadisMainView(params);
        // act
        acadisMainView.render();
        // assert
        expect($(el).find('#content').length).toEqual(1);
      });

      describe('search:resetClear', function () {
        var mediator;
        beforeEach(function () {
          acadisMainView = new AcadisMainView(params);
          mediator = new Mediator();
          acadisMainView.setMediator(mediator);
          acadisMainView.render();
          mediator.trigger('search:resetClear');
        });

        it('should add a reset message', function () {
          expect(acadisMainView.$el.find('#content-explanation-message').length).toEqual(1);
        });

        it('should remove the reset message on a new search', function () {
          mediator.trigger('search:initiated');
          expect(acadisMainView.$el.find('#content-explanation-message').length).toEqual(0);
        });

        it('should replace the current message if one already exists', function () {
          mediator.trigger('search:resetClear');
          expect(acadisMainView.$el.find('#content-explanation-message').length).toEqual(1);
        });
      });

      describe('subview creation', function () {
        var viewsInstantiated = {
          'RightColumnView': RightColumnView,
          'MainHeaderView': MainHeaderView,
          'LeftColumnView': LeftColumnView,
          'HomePageView': HomePageView,
          'SearchErrorView': SearchErrorView
        };
        _.each(viewsInstantiated, function (viewCtor, viewCtorName) {

          it('Should instantiate the ' + viewCtorName + ' view', function () {
            acadisMainView = new AcadisMainView(params);
            acadisMainView.render();
            expect(viewCtor.callCount).toBeGreaterThan(0);
          });
        });
      });
    });
  });
