import LiveDataCentersView from '../../views/LiveDataCentersView';
import Mediator from '../../lib/Mediator';

var createFakeModel = function () { return sinon.createStubInstance(Backbone.Model); };
var SearchParamsModel = sinon.stub().returns(createFakeModel());

describe('LiveDataCentersView', function () {
  var view, fakeDatacenterFacet;

  beforeEach(function () {
    var mediatorStub = sinon.stub(new Mediator());

    view = new LiveDataCentersView({
      dynamicDatacenterCounts: true,
      model: new SearchParamsModel(),
      expectedDataCenters: [
        {
          url: 'http://nsidc.org',
          shortName: 'NSIDC',
          longName: 'National Snow and Ice Data Center'
        }, {
          url: 'https://arcticdata.io/',
          shortName: 'NSF ADC',
          longName: 'NSF Arctic Data Center'
        }, {
          url: 'http://met.no',
          shortName: 'Met.no',
          longName: 'Norwegian Meteorological Institute'
        }
      ]
    });

    view.setMediator(mediatorStub);

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
          longName: 'NSF Arctic Data Center',
          shortName: 'NSF ADC'
        }
      ]
    };

    view.render();

  });

  it('renders the data centers with counts', function () {
    var el;

    view.onDatacentersReturned(fakeDatacenterFacet);

    el = view.$el.find('#count-NSFADC');

    expect(el.text()).toContain('(NSF ADC)');
    expect(el.text()).toContain('103');
  });

  it('renders data center with 0 counts and a "temporarily unavailable" message if not included in facet response', function () {
    var el;

    view.onDatacentersReturned(fakeDatacenterFacet);

    el = view.$el.find('#count-Metno');

    expect(el.text()).toContain('Norwegian Meteorological Institute (Met.no)');
    expect(el.text()).toContain('temporarily unavailable');
  });

});
