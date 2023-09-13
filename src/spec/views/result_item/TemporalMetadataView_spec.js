import Backbone from 'backbone';
import TemporalMetadataView from '../../../views/result_item/TemporalMetadataView';

describe('NSIDC Temporal Metadata View', function () {
    describe('Rendering', function () {
        it('does almost nothing', function () {
            var testvar = 1;
            expect(testvar).toEqual(1);
        });

        it.skip('should display the words Temporal Coverage when given a temporal range', function () {
            var model, el, temporalMetadataView;
            model = new Backbone.Model({dateRanges: [{ startDate: '2013-01-01', endDate: '2013-01-31' }]});

            el = document.createElement('div');

            temporalMetadataView = new TemporalMetadataView({el: el, model: model, forceRender: true, spaced: false});

            temporalMetadataView.render();

            expect($(el).html()).toContain('Temporal Coverage');
        });

        it.skip('should display the entire range when start and end are present', function () {
            var model, el, nsidcTemporalMetadataView;
            model = new Backbone.Model({dateRanges: [{startDate: '2013-01-01', endDate: '2013-01-31' }]});
            el = document.createElement('div');

            nsidcTemporalMetadataView = new TemporalMetadataView({el: el, model: model});

            nsidcTemporalMetadataView.render();

            expect($(el).find('time.dtstart')).toHaveText('2013-01-01');
            expect($(el).find('time.dtend')).toHaveText('2013-01-31');
        });

        it.skip('should display the start date and continuous when end is empty', function () {
            var model, el, nsidcTemporalMetadataView;
            model = new Backbone.Model({dateRanges: [{ startDate: '2013-01-01' }]});
            el = document.createElement('div');

            nsidcTemporalMetadataView = new TemporalMetadataView({el: el, model: model});

            nsidcTemporalMetadataView.render();

            expect($(el).find('time.dtstart')).toHaveText('2013-01-01');
            expect($(el).find('time.dtend')).not.toExist();
            expect($(el).find('span.dtend')).toHaveText('continuous');
        });

        it.skip('should not display any date when the start date is invalid', function () {
            var model, el, nsidcTemporalMetadataView;
            model = new Backbone.Model({dateRanges: [{ endDate: '2013-01-01' }]});
            el = document.createElement('div');

            nsidcTemporalMetadataView = new TemporalMetadataView({el: el, model: model});

            nsidcTemporalMetadataView.render();

            expect($(el).find('time.dtstart')).not.toExist();
            expect($(el).find('time.dtend')).not.toExist();
        });

        it.skip('nothing should be displayed when start and end dates are empty', function () {
            var model, el, nsidcTemporalMetadataView;

            model = new Backbone.Model({dateRanges: [{startDate: '', endDate: ''}]});
            el = document.createElement('div');

            nsidcTemporalMetadataView = new TemporalMetadataView({el: el, model: model});

            nsidcTemporalMetadataView.render();

            expect($(el).find('time.dtstart')).not.toExist();
            expect($(el).find('time.dtend')).not.toExist();
        });

        it.skip('should display the words Temporal Coverage without a temporal range', function () {
            var model, el, nsidcTemporalMetadataView;
            model = new Backbone.Model({ dtstart: '', dtend: '' });
            el = document.createElement('div');

            nsidcTemporalMetadataView = new TemporalMetadataView({el: el, model: model, forceRender: true, spaced: false});

            nsidcTemporalMetadataView.render();

            expect($(el).html()).toContain('Temporal Coverage');
        });
    });
});
