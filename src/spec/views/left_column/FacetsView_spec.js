import SearchParamsModel from '../../models/SearchParamsModel';
import FacetsCollection from '../../collections/FacetsCollection';
import FacetsView from '../../views/left_column/FacetsView';
import objectFactory from '../../lib/objectFactory';

var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };

describe('Facets View', function () {
  var FacetView;
  var facetsView;
  var fakeFacetsCollection,
    fakeParamsModel;

  beforeAll(function () {
    FacetView = sinon.stub().returns(createFakeView());
    objectFactory.register('FacetsView', {Ctor: FacetsView });
    objectFactory.register('FacetView', {Ctor: FacetView });

    fakeParamsModel = new SearchParamsModel({
      'defaults': sinon.stub(),
      'facetFilters': {'facet_data_centers': ['National Snow and Ice Data Center']}
    });

    fakeFacetsCollection = new FacetsCollection([{
      id: 'dataCenters',
      displayName: 'Data Centers',
      parameters: [{
        id: 'nsidc',
        shortName: 'NSIDC',
        name: 'National Snow and Ice Data Center',
        count: 1000
      }, {
        id: 'cisl',
        shortName: 'CISL',
        name: 'Computational Information Systems Laboratory',
        count: 330
      }, {
        id: 'nodc',
        shortName: 'NODC',
        name: 'National Oceanographic Data Center',
        count: 130
      }]
    }]);
  });

  afterAll(function () {
    FacetView.reset();
  });

  beforeEach(function () {
    FacetView.resetHistory();

    facetsView = objectFactory.createInstance('FacetsView', {
      facetsCollection: fakeFacetsCollection,
      searchParamsModel: fakeParamsModel
    });
  });

  it('creates and render the subviews for each facet', function () {
    facetsView.render();

    expect(FacetView).toHaveBeenCalledOnce();
  });
});
