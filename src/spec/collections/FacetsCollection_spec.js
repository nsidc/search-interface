define(['collections/FacetsCollection', 'lib/JSONFacets'],
  function (FacetsCollection, JSONFacets) {
    describe('FacetResultsCollection', function () {
      var facets, facetsCollection,
        osDefaults = { osUrlEndPoint: 'some.fake.url/somewhere',
                       osSearchTerms: 'default terms',
                       osdd: 'fake osdd',
                       osGeoBbox: { lonMin: -180, latMin: 45, lonMax: 180, latMax: 90}
        };

      beforeEach(function () {
        facets = generateFakeFacets();
        facetsCollection = new FacetsCollection(facets);
      });

      it('stores all facets as a collection', function () {
        expect(facetsCollection.size()).toBe(1);
        expect(facetsCollection.at(0).get('id')).toBe('dataCenters');
        expect(facetsCollection.get('dataCenters').attributes.values[0].count).toEqual('1000');
      });

      it('updates the counts on facets when new facet values are provided', function () {
        var newFacets = generateFakeFacets();
        newFacets[0].values[0].count = '500';
        newFacets[0].values[1].count = '265';
        newFacets[0].values.pop();
        newFacets[0].values.pop();

        facetsCollection.onRefinedSearchFacetsData(new JSONFacets({facets: newFacets}));

        expect(facetsCollection.get('dataCenters').attributes.values[0].count).toEqual('500');
        expect(facetsCollection.get('dataCenters').attributes.values[1].count).toEqual('265');
        expect(facetsCollection.get('dataCenters').attributes.values[2].count).toEqual('0');
      });

      describe('Server calls', function () {
        var provider,
          fakeSearchParamsModel,
          FakeOpenSearchProvider = function () {
            this.requestJSON = function (options) {
              var json = new JSONFacets({facets: generateFakeFacets()});

              options.success(json, options);
            };
          };

        beforeEach(function () {
          fakeSearchParamsModel = new Backbone.Model({keyword : 'ice'});
          fakeSearchParamsModel.setFacetFilters = sinon.spy();

          provider = new FakeOpenSearchProvider();

          facetsCollection = new FacetsCollection({
            provider: provider,
            osDefaultParameters: osDefaults,
            facets: facets,
            facetsEnabled: true
          });

          sinon.spy(provider, 'requestJSON');
        });

        afterEach(function () {
          provider.requestJSON.restore();
        });

        it('makes a facet request for search initiated event', function () {
          facetsCollection.onSearchInitiated(fakeSearchParamsModel);

          expect(provider.requestJSON.mock.calls.length).toEqual(1);
          expect(provider.requestJSON.getCall(0)[0].osParameters.osSearchTerms).toEqual('ice');
          expect(provider.requestJSON.getCall(0)[0].osFacetFilters).not.toBeDefined();
        });

        it('makes a facet request for search datacenters only event (for dynamic counts on home page)', function () {
          facetsCollection.onDatacentersOnly(fakeSearchParamsModel);

          expect(provider.requestJSON.mock.calls.length).toEqual(1);
          expect(provider.requestJSON.getCall(0)[0].osParameters.osSearchTerms).toEqual('ice');
          expect(provider.requestJSON.getCall(0)[0].osFacetFilters).not.toBeDefined();
        });

        it('uses facet filters for refined search event', function () {
          fakeSearchParamsModel.set('facetFilters', {facetParameter: ['Albedo', 'Ice Extent']});
          facetsCollection.onRefinedSearch(fakeSearchParamsModel);

          expect(provider.requestJSON.getCall(0)[0].osParameters.osSearchTerms).toEqual('ice');
          expect(provider.requestJSON.getCall(0)[0].osParameters.osFacetFilters).toEqual({facetParameter: ['Albedo', 'Ice Extent']});
        });

        describe('Server responses and processing', function () {
          var fakeMediator;

          beforeEach(function () {
            fakeMediator = sinon.stub(facetsCollection, 'mediatorTrigger');
          });

          afterEach(function () {
            facetsCollection.mediatorTrigger.restore();
          });

          it('triggers the facets returned event', function () {
            facetsCollection.onSearchInitiated(fakeSearchParamsModel);
            expect(fakeMediator.mock.calls.length).toEqual(1);
            expect(fakeMediator.getCall(0)[0]).toEqual('search:facetsReturned');
          });

          it('triggers the facets refined event when facets are refined', function () {

            facetsCollection.onRefinedSearch(fakeSearchParamsModel);
            expect(fakeMediator.mock.calls.length).toEqual(1);
            expect(fakeMediator.getCall(0)[0]).toEqual('search:facetsRefined');
          });

          it('triggers a refined search after the first facet request from the url is complete', function () {
            var facetFilters = { data_center: ['nsidc', 'cisl'] };

            facetsCollection.onSearchUrlParams(fakeSearchParamsModel, facetFilters);
            expect(fakeMediator.mock.calls.length).toEqual(2);
            expect(fakeMediator.getCall(0)[0]).toEqual('search:facetsReturned');
            expect(fakeMediator.getCall(1)[0]).toEqual('search:refinedSearch');
          });

          it('counts the facet values in the response', function () {
            var json = new JSONFacets({facets: generateFakeFacets()});

            expect(facetsCollection.countFacetValues(json.getFacets())).toBe(1475);
          });

          it('triggers a normal search after the first facet request from the url is complete with zero results', function () {
            var facetFilters = { data_center: ['nsidc', 'cisl'] },
                facets = [{id: 'dataCenters', name: 'Data Centers', values: []}],
                json = new JSONFacets({facets: facets});

            facetsCollection.onUrlParamsFacetsData(json, fakeSearchParamsModel, facetFilters);
            expect(fakeMediator.mock.calls.length).toEqual(1);
            expect(fakeMediator.getCall(0)[0]).toEqual('search:initiated');
          });
        });
      });
    });

    var generateFakeFacets = function () {
      return [{
        id: 'dataCenters',
        name: 'Data Centers',
        values: [{
          fullName: 'National Snow and Ice Data Center | NSIDC',
          shortName: 'NSIDC',
          longName: 'National Snow and Ice Data Center',
          count: '1000',
          selected: true
        }, {
          fullName: 'Computational Information Systems Laboratory | CISL',
          shortName: 'CISL',
          longName: 'Computational Information Systems Laboratory',
          count: '335',
          selected: false
        }, {
          fullName: 'National Oceanographic Data Center | NODC Long Short Name',
          shortName: 'NODC Long Short Name',
          longName: 'National Oceanographic Data Center',
          count: '130',
          selected: true
        }, {
          fullName: 'Test Short Name Ellipse | long short name needs ellipses',
          shortName: 'long short name needs ellipses',
          longName: 'Test Short Name Ellipse',
          count: '10',
          selected: true
        }]
      }];
    };
  });
