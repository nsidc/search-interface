// import SearchResultsCollection from '../../../collections/SearchResultsCollection';
// import TemporalCoverageView from '../../../views/search_criteria/TemporalCoverageView';

describe.skip('Temporal Coverage View', function () {
    var temporalCoverageView, searchParameters;

    beforeEach(function () {
        sinon.stub(debug, 'warn');

        searchParameters = {
            setCriteria: sinon.stub(),
            on: sinon.stub()
        };

        temporalCoverageView = new TemporalCoverageView({
            model: searchParameters,
            useEdbDateRange: false // set to false so we don't try to actually make the ajax request while running the test
        });
        temporalCoverageView.render();
    });

    afterEach(function () {
        debug.warn.restore();
    });

    describe('rendering', function () {
        it('has both date start and date end input fields', function () {
            expect(temporalCoverageView.$el.find('input#start-date').length).toBe(1);
            expect(temporalCoverageView.$el.find('input#end-date').length).toBe(1);
        });
    });

    // TODO: SKIPPED because of intermittent failures when running, need to investigate.  Race conditions between
    // the tests for some reason; one alone will pass consistently, but if two or three of them are active, it
    // fails sometimes because the values of the "previously run" test are still there for some reason.
    xdescribe('datepicker date range', function () {
        var setupDatepicker,
            testStartDate = '2001-12-19',
            testEndDate = '3014-07-14';


        beforeEach(function () {
            setupDatepicker = sinon.spy(temporalCoverageView, 'setupDatepicker');
            temporalCoverageView.render();
        });

        it('first renders the datepicker without any date range options', function () {
            expect(setupDatepicker.getCall(0)[0].startDate).toBe(null);
            expect(setupDatepicker.getCall(0)[0].endDate).toBe(null);
        });

        it('updates the datepicker options when the EDB date range request is complete', function () {
            temporalCoverageView.onDateRangeRequestComplete({
                start_date: testStartDate,
                end_date: testEndDate
            });

            expect(setupDatepicker.getCall(0)[0].startDate).toBe(testStartDate);
            expect(setupDatepicker.getCall(0)[0].endDate).toBe(testEndDate);
        });

        it('updates the datepicker with today for the end date if the EDB end date is not in the future', function () {
            var today = moment().format('YYYY-MM-DD');

            testEndDate = '2002-12-18';
            temporalCoverageView.onDateRangeRequestComplete({
                end_date: testEndDate
            });

            expect(setupDatepicker.getCall(0)[0].endDate).toBe(today);
        });

    });

    describe('view actions', function () {
        beforeEach(function () {
            jasmine.addMatchers({
                toBeDisplayed: function () {
                    var notText = this.isNot ? ' not' : '',
                        errorMessageElement = this.actual;

                    this.message = function () {
                        return 'Expected ' + errorMessageElement.html() + notText + ' to be displayed';
                    };

                    return errorMessageElement.css('display') !== 'none';
                }
            });
        });

        it('does not display the date format error message', function () {
            expect(temporalCoverageView.$el.find('div.tipsy').length).toBe(0);
        });

        describe('user types in dates', function () {

            // the tests really only care about the id and value, not the structure
            // of the event object
            var event,
                buildEvent = function (id, value) {
                    return {
                        target: {
                            id: id,
                            value: value
                        }
                    };
                };

            beforeEach(function () {
                var resultsCollection = new SearchResultsCollection(null, {model: searchParameters});
                sinon.stub(resultsCollection, 'performSearch').returns(null);
                temporalCoverageView = new TemporalCoverageView({model: searchParameters, searchResultsCollection: resultsCollection});
                temporalCoverageView.render();
            });

            it('does not change the user\'s date if they typed a complete date for the start date', function () {
                event = buildEvent('start-date', '2014-04-02');
                temporalCoverageView.onBlurInput(event);
                expect(temporalCoverageView.getInputField('start-date')).toBe('2014-04-02');
            });

            it('does not change the user\'s date if they typed a complete date for the end date', function () {
                event = buildEvent('end-date', '2014-04-02');
                temporalCoverageView.onBlurInput(event);
                expect(temporalCoverageView.getInputField('end-date')).toBe('2014-04-02');
            });

            it('fills in January 1 if just the year is typed in', function () {
                event = buildEvent('start-date', '2014');
                temporalCoverageView.onBlurInput(event);
                expect(temporalCoverageView.getInputField('start-date')).toBe('2014-01-01');
            });

            it('fills in the 1st if just the year and month are typed in for the start date', function () {
                event = buildEvent('start-date', '2014-04');
                temporalCoverageView.onBlurInput(event);
                expect(temporalCoverageView.getInputField('start-date')).toBe('2014-04-01');
            });

            it('fills in December 31 if just the year is typed in for the end date', function () {
                event = buildEvent('end-date', '2014');
                temporalCoverageView.onBlurInput(event);
                expect(temporalCoverageView.getInputField('end-date')).toBe('2014-12-31');
            });

            describe('defaults the end date to the last day of the month given a year and month', function () {
                var last = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                // _.each(last, function (day, index) {
                //     var month = '' + (index + 1);
                //
                //     month = month.length === 1 ? '0' + month : month;
                //
                //     it('fills in ' + day + ' for month ' + month, function () {
                //         event = buildEvent('end-date', '2014-' + month);
                //         temporalCoverageView.onBlurInput(event);
                //         expect(temporalCoverageView.getInputField('end-date')).toBe('2014-' + month + '-' + day);
                //     });
                //
                // }, this);

                it('fills in 29 for February in a leap year', function () {
                    event = buildEvent('end-date', '2012-02');
                    temporalCoverageView.onBlurInput(event);
                    expect(temporalCoverageView.getInputField('end-date')).toBe('2012-02-29');
                });

            });

        });

        describe('invalid date parameters', function () {

            beforeEach(function () {
                var resultsCollection = new SearchResultsCollection(null, {model: searchParameters});
                sinon.stub(resultsCollection, 'performSearch').returns(null);
                temporalCoverageView = new TemporalCoverageView({model: searchParameters, searchResultsCollection: resultsCollection});
                temporalCoverageView.render();
            });

            afterEach(function () {
                temporalCoverageView.setInputField('start-date', '');
                temporalCoverageView.setInputField('end-date', '');
                temporalCoverageView.updateDateErrorDisplay();
            });

            describe('invalid date range', function () {

                beforeEach(function () {
                    temporalCoverageView.setInputField('start-date', '2012-04-21');
                    temporalCoverageView.setInputField('end-date', '2012-04-20');
                    temporalCoverageView.updateDateErrorDisplay();
                });

                it('displays an error message when the start date is after the end date', function () {
                    expect($('div.tipsy-inner').text()).toBe('Please change the dates so the start date is before the end date.');
                });
            });

            describe('invalid date format', function () {

                it('displays an error message when the start date does not match the yyyy-mm-dd format', function () {
                    temporalCoverageView.setInputField('start-date', '04-20-2012');
                    temporalCoverageView.updateDateErrorDisplay();
                    expect($('div.tipsy-inner').html()).toBe('Please reformat your date to<br>yyyy-mm-dd');
                });

                it('displays an error message when the end date does not match the yyyy-mm-dd format', function () {
                    temporalCoverageView.setInputField('end-date', '04-21-2012');
                    temporalCoverageView.updateDateErrorDisplay();
                    expect($('div.tipsy-inner').html()).toBe('Please reformat your date to<br>yyyy-mm-dd');
                });
            });

            it('displays only the format error message when both the range and format are invalid', function () {
                temporalCoverageView.setInputField('start-date', '04-21-2012');
                temporalCoverageView.setInputField('end-date', '04-20-2012');
                temporalCoverageView.updateDateErrorDisplay();
                expect($('div.tipsy-inner').html()).toBe('Please reformat your date to<br>yyyy-mm-dd');
            });

        });
    });
});
