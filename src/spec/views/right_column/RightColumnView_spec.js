var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };
var createFakeModel = function () { return sinon.createStubInstance(Backbone.Model); };

define(
  [
    'views/right_column/RightColumnView',
    'lib/Mediator',
    'lib/objectFactory',
    'vendor/debug'
  ],
  function (
            RightColumnView,
            Mediator,
            objectFactory,
            debug) {

    describe('Right Column View', function () {
      var stubList = ['ResultsCountView', 'ResultsPerPageView', 'SearchResultsView',
        'ResultsFooterView', 'PaginationControlsView', 'SortResultsView', 'ResultsHeaderView'];
      var stubViews = {};
      var stubViewInstances = {};
      var SearchParamsModel = sinon.stub().returns(createFakeModel());

      beforeAll(function () {
        _.each(stubList, function (stubName) {
          var fakeView = createFakeView();
          stubViews[stubName] = sinon.stub().returns(fakeView);
          stubViewInstances[stubName] = fakeView;
          objectFactory.register(stubName, {Ctor: stubViews[stubName]});
        });
      });

      beforeEach(function () {
        // No need to actually emit any debugger messages
        sinon.stub(debug, 'warn');

        _.each(stubList, function (stubName) {
          stubViews[stubName].resetHistory();
          stubViewInstances[stubName].render.resetHistory();
        });
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

        expect(stubViews.SearchResultsView).toHaveBeenCalledOnce();

        expect(stubViews.ResultsFooterView).toHaveBeenCalledOnce();
        expect(stubViewInstances.ResultsFooterView.render).toHaveBeenCalledOnce();
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
