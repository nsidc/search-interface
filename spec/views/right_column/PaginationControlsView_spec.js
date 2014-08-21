var createFakeModel = function () { return sinon.createStubInstance(Backbone.Model); };
var createFakeCollection = function () { return sinon.createStubInstance(Backbone.Collection); };

requireMock.requireWithStubs(
  {
    'models/SearchParamsModel': sinon.stub().returns(createFakeModel()),
    'collections/SearchResultsCollection': sinon.stub().returns(createFakeCollection())
  },
  [
    'views/right_column/results_footer/PaginationControlsView',
    'collections/SearchResultsCollection',
    'models/SearchParamsModel',
    'lib/Mediator'
  ],
  function (
    PaginationControlsView,
    SearchResultsCollection,
    SearchParamsModel,
    Mediator
  ) {

    describe('Pagination Controls View', function () {
      var mediator,
          resultsCollection,
          searchParamsModel,
          view;

      beforeEach(function () {
        mediator = sinon.stub(new Mediator());

        resultsCollection = new SearchResultsCollection();
        resultsCollection.getLastPageNumber = sinon.stub().returns(7);
        resultsCollection.getPageNumber = sinon.stub().returns(4);
        resultsCollection.getTotalResultsCount = sinon.stub().returns(10);

        searchParamsModel = new SearchParamsModel();
        searchParamsModel.setPageNumber = sinon.spy();
        searchParamsModel.get = sinon.stub();

        view = new PaginationControlsView({
          collection: resultsCollection,
          model: searchParamsModel
        });
        view.setMediator(mediator);
        view.render();
      });

      describe('Basic rendering and appearance', function () {

        it('creates a container element with class .pagination', function () {
          expect(view.$el).toHaveClass('pagination');
        });

        it('has a first page button', function () {
          expect(view.$('a[title="Go to page 1"]').length).toEqual(1);
        });

        it('has a last page button', function () {
          expect(view.$('a[title="Go to page 7"]').length).toEqual(1);
        });

        it('has a previous page button', function () {
          expect(view.$('a.prev').length).toEqual(1);
        });

        it('has a next page button', function () {
          expect(view.$('a.next').length).toEqual(1);
        });

      });

      describe('the visible page numbers with 7 pages of results', function () {
        var range,
            options;

        // key: current page
        // value: the page numbers that should be visible and clickable
        options = {
          1: [1, 2, 7],
          2: [1, 2, 3, 7],
          3: [1, 2, 3, 4, 7],
          4: [1, 2, 3, 4, 5, 6, 7],
          5: [1, 4, 5, 6, 7],
          6: [1, 5, 6, 7],
          7: [1, 6, 7]
        };

        range = [1, 2, 3, 4, 5, 6, 7];

        _.each(options, function (visiblePages, currentPage) {
          it('gives links for pages ' + visiblePages + ' and only those pages when on page ' + currentPage, function () {
            var hiddenPages = _.difference(range, visiblePages);

            resultsCollection.getPageNumber = sinon.stub().returns(currentPage);
            view.render();

            _.each(visiblePages, function (visiblePage) {
              expect(view.$el.html()).toContain('title="Go to page ' + visiblePage + '"');
            });

            _.each(hiddenPages, function (hiddenPage) {
              expect(view.$el.html()).not.toContain('title="Go to page ' + hiddenPage + '"');
            });

          });
        });

      });

      describe('a single page of results', function () {

        beforeEach(function () {
          resultsCollection.getLastPageNumber = sinon.stub().returns(1);
          resultsCollection.getPageNumber = sinon.stub().returns(1);
        });

        it('is hidden', function () {
          view.onSearchComplete();
          expect(view.$el).toHaveClass('hidden');
        });

      });

      describe('no results', function () {

        beforeEach(function () {
          resultsCollection.getTotalResultsCount = sinon.stub().returns(0);
        });

        it('is hidden', function () {
          view.showControls();
          view.onSearchComplete();
          expect(view.$el).toHaveClass('hidden');
        });

      });

      describe('updating the search params model', function () {

        it('decrements the searchParamsModel pageNumber value when the prev page button is clicked', function () {
          view.onClickPrevPageButton();
          expect(searchParamsModel.setPageNumber).toHaveBeenCalledWith(3);
        });

        it('sets the searchParamsModel pageNumber value to 1 when the first page button is clicked', function () {
          view.onClickPageSelector({
            target: view.$('a[title="Go to page 1"]')[0]
          });

          expect(searchParamsModel.setPageNumber).toHaveBeenCalledWith(1);
        });

        it('increments the searchParamsModel pageNumber value when the next page button is clicked', function () {
          view.onClickNextPageButton();
          expect(searchParamsModel.setPageNumber).toHaveBeenCalledWith(5);
        });

      });

      describe('triggering the "search:refinedSearch" event', function () {
        it('triggers when a page number is clicked', function () {
          view.onClickPageSelector({
            target: {
              text: '1'
            }
          });
          expect(mediator.trigger).toHaveBeenCalledWith('search:refinedSearch');
        });

        it('triggers when the previous page button is clicked', function () {
          view.onClickPrevPageButton();
          expect(mediator.trigger).toHaveBeenCalledWith('search:refinedSearch');
        });

        it('triggers when the next page button is clicked', function () {
          view.onClickNextPageButton();
          expect(mediator.trigger).toHaveBeenCalledWith('search:refinedSearch');
        });
      });

      describe('mediated event handling', function () {
        beforeEach(function () {
          mediator = new Mediator();
          view.setMediator(mediator);
        });

        it('hides itself when the app goes home', function () {
          // guard assertion
          expect(view.$el).not.toHaveClass('hidden');

          mediator.trigger('app:home');

          expect(view.$el).toHaveClass('hidden');
        });

        it('hides itself when a new search is intiated', function () {
          // guard assertion
          expect(view.$el).not.toHaveClass('hidden');

          mediator.trigger('search:initiated');

          expect(view.$el).toHaveClass('hidden');
        });

        it('shows itself when a new set of search results is ready', function () {
          view.hideControls();

          mediator.trigger('search:complete');

          expect(view.$el).not.toHaveClass('hidden');
        });

        it('shows itself when an in-progress search is canceled if there are previous results', function () {
          view.hideControls();

          mediator.trigger('search:displayPreviousResults');

          expect(view.$el).not.toHaveClass('hidden');
        });
      });

    });

  });
