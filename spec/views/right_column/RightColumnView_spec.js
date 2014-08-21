var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };
var createFakeModel = function () { return sinon.createStubInstance(Backbone.Model); };

requireMock.requireWithStubs(
  {
    'models/SearchParamsModel': sinon.stub().returns(createFakeModel()),
    'views/right_column/SearchResultsView': sinon.stub().returns(createFakeView()),
    'views/right_column/results_footer/ResultsFooterView': sinon.stub().returns(createFakeView()),
    'views/right_column/results_header/ResultsHeaderView': sinon.stub().returns(createFakeView()),
    'views/right_column/results_header/ResultsCountView': sinon.stub().returns(createFakeView()),
    'views/right_column/results_header/ResultsPerPageView': sinon.stub().returns(createFakeView()),
    'views/right_column/results_footer/PaginationControlsView': sinon.stub().returns(createFakeView()),
    'views/right_column/results_header/SortResultsView': sinon.stub().returns(createFakeView())
  },
  [
    'views/right_column/SearchResultsView',
    'views/right_column/results_footer/ResultsFooterView',
    'views/right_column/results_header/ResultsHeaderView',
    'views/right_column/RightColumnView',
    'views/right_column/results_header/ResultsCountView',
    'views/right_column/results_header/ResultsPerPageView',
    'views/right_column/results_footer/PaginationControlsView',
    'views/right_column/results_header/SortResultsView',
    'models/SearchParamsModel',
    'lib/Mediator',
    'lib/objectFactory',
    'vendor/debug'
  ],
  function (
            SearchResultsView,
            ResultsFooterView,
            ResultsHeaderView,
            RightColumnView,
            ResultsCountView,
            ResultsPerPageView,
            PaginationControlsView,
            SortResultsView,
            SearchParamsModel,
            Mediator,
            objectFactory,
            debug) {

    describe('Right Column View', function () {
      beforeEach(function () {
        var views;

        // No need to actually emit any debugger messages
        sinon.stub(debug, 'warn');

        // reset mock counts (if they exist)
        views = [ResultsCountView, ResultsPerPageView, SearchResultsView, ResultsFooterView, PaginationControlsView, SortResultsView];

        _.each(views, function (view) {
          if (view.firstCall) {
            view.firstCall.returnValue.render.reset();
          }
          view.reset();
        }, this);

        objectFactory.register('PaginationControlsView',
          {
            Ctor: PaginationControlsView
          }
        );

        objectFactory.register('ResultsPerPageView',
          {
            Ctor: PaginationControlsView,
            configOptions: { preset: { features: {resultsPerPage: 10 } } }
          }
        );

        objectFactory.register('ResultsHeaderView',
          {
            Ctor: ResultsHeaderView
          }
        );

      });

      afterEach(function () {
        debug.warn.restore();
      });

      it('creates and renders subviews', function () {
        var fakeParamsModel  = new SearchParamsModel(),
            fakeResultsCollection = new Backbone.Collection(),
            rightColumnView;

        rightColumnView = new RightColumnView({
          searchParamsModel: fakeParamsModel,
          collection: fakeResultsCollection
        });

        rightColumnView.render();

        expect(SearchResultsView).toHaveBeenCalledOnce();

        expect(ResultsFooterView).toHaveBeenCalledOnce();
        expect(ResultsFooterView.firstCall.returnValue.render).toHaveBeenCalledOnce();
      });

      it('should create a correctly structured element as provided', function () {
        var element = document.createElement('div'),
            fakeParamsModel  = new SearchParamsModel(),
            fakeResultsCollection = new Backbone.Collection(),
            rightColumnView;

        rightColumnView = new RightColumnView({
          el: element,
          searchParamsModel: fakeParamsModel,
          collection: fakeResultsCollection
        });

        rightColumnView.render();

        expect(rightColumnView.$el.find('.results-header').length).toBe(1);
        expect(rightColumnView.$el.find('#results').length).toBe(1);
        expect(rightColumnView.$el.find('.results-footer').length).toBe(1);
      });

      describe('visibility with search events', function () {
        var mediator, rightColumnView;

        beforeEach(function () {
          mediator = new Mediator();
          rightColumnView = new RightColumnView({
            searchParamsModel: new SearchParamsModel(),
            collection: new Backbone.Collection()
          });

          rightColumnView.setMediator(mediator);
          rightColumnView.render();
        });

        it('should be hidden when the app goes home', function () {
          expect(rightColumnView.$el.find('#current-results')).not.toHaveClass('hidden');

          mediator.trigger('app:home');

          expect(rightColumnView.$el.find('#current-results')).toHaveClass('hidden');
          expect(rightColumnView.$el.find('#filtering-results')).toHaveClass('hidden');
        });

        it('should not be visible when a new search is initiated', function () {
          mediator.trigger('search:initiated');

          expect(rightColumnView.$el.find('#current-results')).toHaveClass('hidden');
          expect(rightColumnView.$el.find('#filtering-results')).toHaveClass('hidden');
        });

        it('should not be visible when a reset is hit', function () {
          expect(rightColumnView.$el.find('#current-results')).not.toHaveClass('hidden');

          mediator.trigger('search:resetClear');

          expect(rightColumnView.$el.find('#current-results')).toHaveClass('hidden');
          expect(rightColumnView.$el.find('#filtering-results')).toHaveClass('hidden');
        });

        it('should show filtering message when facet is changed', function () {
          mediator.trigger('search:refinedSearch');

          expect(rightColumnView.$el.find('#current-results')).toHaveClass('hidden');
          expect(rightColumnView.$el.find('#filtering-results')).not.toHaveClass('hidden');
        });

        it('should be visible when a search is completed', function () {
          mediator.trigger('search:initiated');
          mediator.trigger('search:complete');

          expect(rightColumnView.$el).not.toHaveClass('hidden');
        });

        it('should be visible when a search is canceled if there are previous results', function () {
          mediator.trigger('search:initiated');
          mediator.trigger('search:displayPreviousResults');

          expect(rightColumnView.$el).not.toHaveClass('hidden');
        });

      });
    });
  });
