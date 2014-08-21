var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };

requireMock.requireWithStubs(
  {
    'views/result_item/ResultItemView': sinon.stub().returns(createFakeView())
  },
  [
    'views/right_column/SearchResultsView',
    'views/result_item/ResultItemView',
    'lib/objectFactory'
  ],
  function (SearchResultsView, ResultItemView, objectFactory) {

    describe('Search Results View', function () {

      beforeEach(function () {
        ResultItemView.returnValue.render.reset();
        ResultItemView.reset();

        objectFactory.setConfig({
          'ResultItemView': ResultItemView
        });
      });

      // TODO: 2012-03-08:<mhs> Pull out repeated code in a before each for the stubs </mhs>

      it('creates Result Item view for every model in the collection', function () {
        // Arrange
        var searchResults, view;
        searchResults = new Backbone.Collection([{}, {}, {}]);

        // Act
        view = new SearchResultsView({ collection: searchResults });

        // Assert
        expect(ResultItemView).toHaveBeenCalledThrice();
      });

      it('should get the search results content divs from ResultItemView', function () {
        // arrange
        var view, searchResults;
        searchResults = new Backbone.Collection([{}, {}]);

        // act
        view = new SearchResultsView({
          collection: searchResults
        });

        // assert
        expect(ResultItemView.returnValue.render.callCount).toEqual(2);
      });

      it('should pass models to the subview constructors', function () {
        // arrange
        var searchResults, view;
        searchResults = new Backbone.Collection([{a: 1}, {b: 2}]);

        // act
        view = new SearchResultsView({
          collection: searchResults
        });

        // assert
        expect(ResultItemView.args[0][0].model).toBe(searchResults.at(0));
        expect(ResultItemView.args[1][0].model).toBe(searchResults.at(1));
      });
    });
  });
