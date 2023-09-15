import Backbone from 'backbone';
import TemporalMetadataView from '../../../views/result_item/TemporalMetadataView';
import _ from 'underscore';

describe('NSIDC Temporal Metadata View', function () {
    describe('Content', function () {
       it('keeps start and end when both exist', function () {
           // one pair
           // multiple pairs
           //<dc:date>1973-01-01/2500-12-31</dc:date>
           //<dc:date>2006-01-01/</dc:date>
           let rangeList = [
               ['1980-01-01', '2010-12-31'],
               ['1990-01-01', '2020-12-31']
           ];
           let rangeArr = [];

           rangeArr = _.map(rangeList, function(range) {
               return { startDate: range[0], endDate: range[1] };
           })
           expect(rangeArr.length).toEqual(2);

           let filtered = new TemporalMetadataView({}).filterRanges(rangeArr);
           expect(filtered).toEqual(rangeArr);
       });

       it('keeps only the start and shows present if end is empty', function () {
           // one pair
           // multiple pairs
           let rangeList = [
               ['1980-01-01', ''],
               ['', '2020-12-31'],
               ['', '']
           ];

           let rangeArr = [];

           rangeArr = _.map(rangeList, function(range) {
               return { startDate: range[0], endDate: range[1] };
           })
           expect(rangeArr.length).toEqual(3);

           let filtered = new TemporalMetadataView({}).filterRanges(rangeArr);
           expect(filtered.length).toEqual(1);
           expect(filtered[0]).toEqual(rangeArr[0]);
           expect(filtered[0].startDate).toMatch('1980-01-01');
           expect(filtered[0].endDate).toMatch('present');
       });

       it('does not keep entries with missing start date', function () {
           // empty string, undefined, not a date
           // one pair
           // multiple pairs
           let rangeList = [
               ['1980-01-01', ''],
               ['', '2020-12-31'],
               ['', '']
           ];
       });
    });

    describe('Rendering', function () {
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
