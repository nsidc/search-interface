var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };

requireMock.requireWithStubs(
  {
    'views/left_column/FacetView': sinon.stub().returns(createFakeView())
  },
  [
    'models/SearchParamsModel',
    'views/left_column/FacetView',
    'collections/FacetsCollection',
    'views/left_column/FacetsView',
    'lib/objectFactory'
  ],
  function (
    SearchParamsModel,
    FacetView,
    FacetsCollection,
    FacetsView,
    objectFactory
  ) {

    objectFactory.register('FacetsView', {Ctor: FacetsView });
    objectFactory.register('FacetView', {Ctor: FacetView });

    var fakeFacetsCollection,
      fakeParamsModel;

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

    describe('Facets View', function () {
      var facetsView;

      beforeEach(function () {
        FacetView.reset();

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
  });
