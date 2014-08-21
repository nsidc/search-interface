var createFakeModel = function () { return sinon.createStubInstance(Backbone.Model); };

requireMock.requireWithStubs(
  {
    'models/SearchParamsModel': sinon.stub().returns(createFakeModel())
  },
  [
    'views/right_column/results_header/ResultsHeaderView',
    'views/right_column/results_header/ResultsPerPageView',
    'views/right_column/results_header/SortResultsView',
    'collections/SearchResultsCollection',
    'models/SearchParamsModel',
    'lib/Mediator',
    'lib/objectFactory'
  ],
  function (
    ResultsHeaderView,
    ResultsPerPageView,
    SortResultsView,
    SearchResultsCollection,
    SearchParamsModel,
    Mediator,
    objectFactory
  ) {

    describe('Results Header View', function () {
      var mediator,
          resultsCollection,
          searchParamsModel,
          view;

      beforeEach(function () {

        objectFactory.setConfig({
          'SortResultsView': {
            Ctor: SortResultsView,
            configOptions: { preset: { sortByOptions: {} } }
          },
          'ResultsPerPageView': {
            Ctor: ResultsPerPageView,
            configOptions: { preset: { features: { resultsPerPage: [] } } }
          }
        });

        resultsCollection = new SearchResultsCollection();
        searchParamsModel = new SearchParamsModel();

        mediator = sinon.stub(new Mediator());

        // sinon.stub(resultsCollection, 'getTotalResultsCount').returns(37);
        view = new ResultsHeaderView({
          searchParamsModel: searchParamsModel,
          searchResultsCollection: resultsCollection
        });
        view.setMediator(mediator);
      });

      describe('with results', function () {
        beforeEach(function () {
          sinon.stub(resultsCollection, 'getTotalResultsCount').returns(37);
          view.render();
        });

        it('renders the results count view', function () {
          expect(view.$el.find('.results-count').text()).not.toBe('');
        });

        it('does render the result options', function () {
          expect(view.$el.find('.result-options').text()).not.toBe('');
        });

      });

      describe('with no results', function () {
        beforeEach(function () {
          sinon.stub(resultsCollection, 'getTotalResultsCount').returns(0);
          view.render();
        });

        it('renders the results count view', function () {
          expect(view.$el.find('.results-count').text()).not.toBe('');
        });

        it('does not render the result options', function () {
          expect(view.$el.find('.result-options').text().trim()).toBe('');
        });

      });

    });

  });
