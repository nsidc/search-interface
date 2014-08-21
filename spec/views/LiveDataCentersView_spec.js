var createFakeModel = function () { return sinon.createStubInstance(Backbone.Model); };

requireMock.requireWithStubs(
  {
    'models/SearchParamsModel': sinon.stub().returns(createFakeModel())
  },
  [
    'models/SearchParamsModel',
    'views/LiveDataCentersView'
  ],
  function (
    SearchParamsModel,
    LiveDataCentersView
  ) {

    describe('LiveDataCentersView', function () {
      var view, fakeDatacenterFacet;

      beforeEach(function () {
        view = new LiveDataCentersView({
          dynamicDatacenterCounts: true,
          model: new SearchParamsModel(),
          expectedDataCenters: [
            {
              url: 'http://nsidc.org',
              shortName: 'NSIDC',
              longName: 'National Snow and Ice Data Center'
            }, {
              url: 'http://aoncadis.org',
              shortName: 'ACADIS Gateway',
              longName: 'Advanced Cooperative Arctic Data and Information Service'
            }, {
              url: 'http://met.no',
              shortName: 'Met.no',
              longName: 'Norwegian Meteorological Institute'
            }
          ]
        });

        fakeDatacenterFacet = {
          id: 'facet_data_center',
          name: 'Data Center',
          values: [
            {
              count: '260',
              longName: 'National Snow and Ice Data Center',
              shortName: 'NSIDC'
            },
            {
              count: '103',
              longName: 'Advanced Cooperative Arctic Data and Information Service',
              shortName: 'ACADIS Gateway'
            }
          ]
        };

        view.render();

      });

      it('renders the data centers with counts', function () {
        var el;

        view.onDatacentersReturned(fakeDatacenterFacet);

        el = view.$el.find('#count-ACADISGateway');

        expect(el.text()).toContain('(ACADIS Gateway)');
        expect(el.text()).toContain('103 datasets');
      });

      it('renders data center with 0 counts and a "temporarily unavailable" message if not included in facet response', function () {
        var el;

        view.onDatacentersReturned(fakeDatacenterFacet);

        el = view.$el.find('#count-Metno');

        expect(el.text()).toContain('Norwegian Meteorological Institute (Met.no)');
        expect(el.text()).toContain('temporarily unavailable');
      });

    });

  });
