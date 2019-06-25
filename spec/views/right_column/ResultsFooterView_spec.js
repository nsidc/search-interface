var createFakeView = function () {return sinon.createStubInstance(Backbone.View);};

define(
  ['views/right_column/results_footer/ResultsFooterView', 'lib/objectFactory'],
  function (ResultsFooterView, objectFactory) {
    describe('Results Footer View', function () {
      var fakeView = createFakeView();
      var PaginationControlsView = sinon.stub().returns(fakeView);
      var createInstanceStub;

      beforeAll(function () {
        createInstanceStub = sinon.stub(objectFactory, 'createInstance').returns(fakeView);
        objectFactory.register('PaginationControlsView', {Ctor: PaginationControlsView});
      });

      afterAll(function () {
        objectFactory.createInstance.restore();
      });

      beforeEach(function () {
        createInstanceStub.resetHistory();
        PaginationControlsView.resetHistory();
        fakeView.render.resetHistory();
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
