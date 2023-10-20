// import DatacenterView from '../../views/result_item/DatacenterView';

describe.skip('DatacenterView', function () {

    // alias for the namespaced constructor
    var datacenterView,
        fakeSearchResultsModel,
        element;

    beforeEach(function () {
        element = document.createElement('div');
    });

    it('displays a label and the datacenter name', function () {
        fakeSearchResultsModel = new Backbone.Model({dataCenterNames: ['A Real Data Center']});

        datacenterView = new DatacenterView({el: element, model: fakeSearchResultsModel});

        datacenterView.render();

        expect($(element).find('.label').length).toEqual(1);
        expect($(element).find('.datacenter-name').text()).toEqual('A Real Data Center');
    });

    it('doesn\'t display any data center fields if there is no data center', function () {
        fakeSearchResultsModel = new Backbone.Model({dataCenterNames: []});
        datacenterView = new DatacenterView({el: element, model: fakeSearchResultsModel});

        datacenterView.render();

        expect($(element).find('.label').length).toEqual(0);
    });

    it('displays multiple datacenter names separated by slashes', function () {
        fakeSearchResultsModel = new Backbone.Model({dataCenterNames: ['First Real Data Center', 'Second Real Data Center']});
        datacenterView = new DatacenterView({el: element, model: fakeSearchResultsModel});

        datacenterView.render();

        expect($(element).find('.datacenter-name').text()).toEqual('First Real Data Center / Second Real Data Center');
    });
});
