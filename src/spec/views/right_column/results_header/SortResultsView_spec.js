import SortResultsView from '../../../views/right_column/results_header/SortResultsView';
import SearchResultsCollection from '../../../collections/SearchResultsCollection';

var createFakeModel = function () { return sinon.createStubInstance(Backbone.Model); };

describe('Sort Results View', function () {
  var sortByOptions,
      view;

  beforeEach(function () {
    var SearchParamsModel = sinon.stub().returns(createFakeModel());

    var resultsCollection = new SearchResultsCollection(),
        searchParamsModel = new SearchParamsModel();

    sortByOptions = {
      'score,,desc': 'Relevance (highest to lowest)',
      'spatial_area,,asc': 'Area (smallest to largest)',
      'spatial_area,,desc': 'Area (largest to smallest)',
      'temporal_duration,,asc': 'Duration (shortest to longest)',
      'temporal_duration,,desc': 'Duration (longest to shortest)',
      'updated,,desc': 'Last Updated (newest to oldest)'
    };

    searchParamsModel.setSortKeys = sinon.stub();
    sinon.stub(resultsCollection, 'getSortKeys').returns('spatial_area,,asc');
    view = new SortResultsView({
      model: searchParamsModel,
      collection: resultsCollection,
      sortByOptions: sortByOptions
    }).render();
  });

  it('gets the currently selected choice based on the search results collection', function () {
    expect(view.getSelectedOption()).toBe('Area (smallest to largest)');
  });

  it('renders "sort by" text in the label', function () {
    expect(view.$el.find('label').text()).toBe('Sort by:');
  });

  it('returns the id that the dropdown button element should have', function () {
    expect(view.getButtonId()).toBe('sort-results');
  });

});
