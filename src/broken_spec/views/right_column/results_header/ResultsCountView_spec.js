// import ResultsCountView from '../../../views/right_column/results_header/ResultsCountView';
// import SearchResultsCollection from '../../../collections/SearchResultsCollection';

describe.skip('Results Count View', function () {
    var resultsCollection,
        view;

    beforeEach(function () {
        resultsCollection = new SearchResultsCollection();

        sinon.stub(resultsCollection, 'getItemsPerPage').returns(4);
        sinon.stub(resultsCollection, 'getPageNumber').returns(4);
        view = new ResultsCountView({
            collection: resultsCollection
        });
    });

    it('displays the total number of search results, and which results are displayed', function () {
        sinon.stub(resultsCollection, 'getTotalResultsCount').returns(400);
        view.render();
        expect(view.$el.text().trim().replace(/\s+/g, ' ')).toBe('Showing 13-16 of 400 Data Sets');
    });

    it('displays a special message when there are 0 results', function () {
        sinon.stub(resultsCollection, 'getTotalResultsCount').returns(0);
        view.render();
        expect(view.$el.text().trim().replace(/\s+/g, ' ')).toBe('Showing 0 Data Sets');
    });

});
