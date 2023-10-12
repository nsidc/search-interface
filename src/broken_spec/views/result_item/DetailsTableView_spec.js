// import DetailsTableView from '../../views/result_item/DetailsTableView';

describe.skip('Details Table View', function () {

    var detailsTableView,
        model,
        element;

    beforeEach(function () {
        element = document.createElement('div');
    });

    describe('rendered page', function () {

        beforeEach(function () {
            model = new Backbone.Model({
                summary: 'test dataset summary',
                keywords: 'key1; key2',
                updated: '2013-04-11',
                dataFormats: 'ascii; binary'
            });
            detailsTableView = new DetailsTableView({el: element, model: model});
            detailsTableView.render();
        });

        it('contains the summary', function () {
            expect($(element).html()).toContain(model.get('summary'));
        });

        it('contains the keywords', function () {
            expect($(element).html()).toContain(model.get('keywords'));
        });

        it('contains the last updated', function () {
            expect($(element).html()).toContain(model.get('updated'));
        });

        it('contains the data format', function () {
            expect($(element).html()).toContain(model.get('dataFormats'));
        });
    });
});
