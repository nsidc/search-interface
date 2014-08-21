/* global requireMock */

var fakeView = sinon.createStubInstance(Backbone.View);

requireMock.requireWithStubs(
  {
    'views/right_column/PaginationControlsView': sinon.stub().returns(fakeView)
  },
  ['views/right_column/results_footer/ResultsFooterView', 'views/right_column/PaginationControlsView', 'lib/objectFactory'],
  function (ResultsFooterView, PaginationControlsView, objectFactory) {
    describe('Results Footer View', function () {
      var createInstanceStub = sinon.stub(objectFactory, 'createInstance').returns(fakeView);

      afterEach(function () {
        createInstanceStub.reset();
        PaginationControlsView.reset();
        fakeView.render.reset();
      });

      describe('rendering', function () {
        it('should have a results-footer div as its root element', function () {
          var view = new ResultsFooterView({searchParamsModel: sinon.stub(), searchResultsCollection: sinon.stub()}).render();
          expect(view.$el.hasClass('results-footer')).toBe(true);
        });

        it('should create a .pagination element', function () {
          var view = new ResultsFooterView({searchParamsModel: sinon.stub(), searchResultsCollection: sinon.stub()}).render();
          expect(view.$el.find('.pagination').length).toEqual(1);
        });
      });

      describe('subviews', function () {
        it('should create and render a single PaginationControlsView', function () {
          // act
          new ResultsFooterView({searchParamsModel: sinon.stub(), searchResultsCollection: sinon.stub()}).render();

          // assert
          expect(createInstanceStub).toHaveBeenCalledOnce();
          expect(createInstanceStub).toHaveBeenCalledWith('PaginationControlsView');
          expect(fakeView.render).toHaveBeenCalledOnce();
        });
      });

    });
  });
