import Backbone from 'backbone';
import TemporalMetadataView from '../../../views/result_item/TemporalMetadataView.js';
import _ from 'underscore';

describe('NSIDC Temporal Metadata View', function () {
    describe('Content', function () {
        function dateRangesToObject(rangeList) {
            return _.map(rangeList, function (range) {
                return {startDate: range[0], endDate: range[1]};
            })
        }

        it('keeps start and end when both exist', function () {
            let rangeList = [
                ['1980-01-01', '2010-12-31'],
                ['1990-01-01', '2020-12-31']
            ];

            let rangeArr = dateRangesToObject(rangeList);
            expect(rangeArr.length).toEqual(2);

            let filtered = new TemporalMetadataView({}).filterRanges(rangeArr);
            expect(filtered.length).toEqual(2);
            expect(filtered[0].startDate).toMatch('1980-01-01');
            expect(filtered[0].endDate).toMatch('2010-12-31');
            expect(filtered[1].startDate).toMatch('1990-01-01');
            expect(filtered[1].endDate).toMatch('2020-12-31');
        });

        it('keeps only the start and shows present if end is empty', function () {
            let rangeList = [
                ['1970-01-01', '2000-12-31'],
                ['1980-01-01', '']
            ];

            let rangeArr = dateRangesToObject(rangeList);
            expect(rangeArr.length).toEqual(2);

            let filtered = new TemporalMetadataView({}).filterRanges(rangeArr);
            expect(filtered.length).toEqual(2);
            expect(filtered[0].startDate).toMatch('1970-01-01');
            expect(filtered[0].endDate).toMatch('2000-12-31');
            expect(filtered[1].startDate).toMatch('1980-01-01');
            expect(filtered[1].endDate).toMatch('present');
        });

        it('does not keep entries with missing start date', function () {
            let rangeList = [
                ['', '2020-12-31'],
                ['', '']
            ];
            let rangeArr = dateRangesToObject(rangeList);
            expect(rangeArr.length).toEqual(2);

            let filtered = new TemporalMetadataView({}).filterRanges(rangeArr);
            expect(filtered.length).toEqual(0);
        });
    });

    describe('Rendering', function () {
        it('should display the words Temporal Coverage when given a temporal range', function () {
            let model, el, temporalMetadataView;
            model = new Backbone.Model({dateRanges: [{ startDate: '2013-01-01', endDate: '2013-01-31' }]});

            el = document.createElement('div');

            temporalMetadataView = new TemporalMetadataView({el: el, model: model, forceRender: true, spaced: false});

            temporalMetadataView.render();

            expect(el).toContainHTML('Temporal Coverage');
        });

        it('should display the entire range when start and end are present', function () {
            let model, el, nsidcTemporalMetadataView;
            model = new Backbone.Model({dateRanges: [{startDate: '2013-01-01', endDate: '2013-01-31' }]});
            el = document.createElement('div');

            nsidcTemporalMetadataView = new TemporalMetadataView({el: el, model: model});

            nsidcTemporalMetadataView.render();

            expect(el.querySelector('time.dtstart')).toHaveTextContent('2013-01-01');
            expect(el.querySelector('time.dtend')).toHaveTextContent('2013-01-31')
        });

        it('should display the start date and continuous when end is empty', function () {
            let model, el, nsidcTemporalMetadataView;
            model = new Backbone.Model({dateRanges: [{ startDate: '2013-01-01' }]});
            el = document.createElement('div');

            nsidcTemporalMetadataView = new TemporalMetadataView({el: el, model: model});

            nsidcTemporalMetadataView.render();

            expect(el.querySelector('time.dtstart')).toHaveTextContent('2013-01-01');
            expect(el.querySelector('time.dtend')).toHaveTextContent('present');
        });

        it('should not display any date when the start date is invalid', function () {
            let model, el, nsidcTemporalMetadataView;
            model = new Backbone.Model({dateRanges: [{ endDate: '2013-01-01' }]});
            el = document.createElement('div');

            nsidcTemporalMetadataView = new TemporalMetadataView({el: el, model: model});

            nsidcTemporalMetadataView.render();

            expect(el.querySelector('time.dtstart')).toBeNull();
            expect(el.querySelector('time.dtend')).toBeNull();
        });

        it('nothing should be displayed when start and end dates are empty', function () {
            let model, el, nsidcTemporalMetadataView;

            model = new Backbone.Model({dateRanges: [{startDate: '', endDate: ''}]});
            el = document.createElement('div');

            nsidcTemporalMetadataView = new TemporalMetadataView({el: el, model: model});

            nsidcTemporalMetadataView.render();

            expect(el.querySelector('time.dtstart')).toBeNull();
            expect(el.querySelector('time.dtend')).toBeNull();
        });

        it('should display the words Temporal Coverage without a temporal range', function () {
            let model, el, nsidcTemporalMetadataView;
            model = new Backbone.Model({ dtstart: '', dtend: '' });
            el = document.createElement('div');

            nsidcTemporalMetadataView = new TemporalMetadataView({el: el, model: model, forceRender: true, spaced: false});

            nsidcTemporalMetadataView.render();

            expect(el).toContainHTML('Temporal Coverage');
        });
    });
});
