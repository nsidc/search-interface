import _ from 'underscore';
import $ from 'jquery';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isValid, parse } from 'date-fns';

import { Datepicker } from 'vanillajs-datepicker';
// See 'A Tale of Exports and Imports' in DEVELOPMENT.md:
import 'vjs-datepicker/datepicker-bs4.css';

import 'tippy.js/dist/tippy.css'
import tippy from 'tippy.js';

import InputViewBase from '../InputViewBase';
import viewTemplate from '../../templates/search_criteria/temporal_search.html';


/**
 * Attempts to parse manually-entered dates, completing them with a month or day
 * (if necessary) using the provided completion functions. The resulting date
 * object is passed to the datepicker as its selected date.
 */
function toValue(dayCompletion, monthDayCompletion, date) {
    const dateFormats = [
        ['yyyy-MM-dd', _.identity],
        ['yyyy-MM', dayCompletion],
        ['yyyy', monthDayCompletion]
    ];

    const dates = _.map(dateFormats,
        function ([format, completion]) {
            let parsed = completion(parse(date, format, new Date()));
            return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
        });

    let completedDate = _.first(_.filter(dates, isValid)) || _.first(dates);
    return completedDate;
}

/**
 * Formats a valid Date as a textual representation, e.g., 2010-03-31 for
 * display in the datepicker input field.
 */
function toDisplay(date) {
    date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return format(date, 'yyyy-MM-dd');
}

// https://mymth.github.io/vanillajs-datepicker/#/options
// buttonClass is `btn` for integration with Bootstrap styles
// minDate & maxDate filled in once the catalog-services request is complete
const datepickerOptions = {
    autohide: true,
    buttonClass: 'btn',
    minDate: null,
    maxDate: null,
    startView: 2,
    minViewMode: 0,
    showOnFocus: false,
    showOnClick: false
};

// https://kabbouchi.github.io/tippyjs-v4-docs/all-options/
const tippyOptions = {
    placement: 'top-start',
    trigger: 'manual',
    allowHTML: true
};

const dateStatus = {
    BAD_FORMAT_START: {
        element: 'input#start-date',
        highlightElements: ['input#start-date'],
        message: 'Please reformat your date to<br>yyyy-mm-dd'
    },
    BAD_FORMAT_END: {
        element: 'input#end-date',
        highlightElements: ['input#end-date'],
        message: 'Please reformat your date to<br>yyyy-mm-dd'
    },
    BAD_DATE_RANGE: {
        element: 'div.start-date',
        highlightElements: ['input#start-date', 'input#end-date'],
        message: 'Please change the dates so the start date is before the end date.'
    }
};

class TemporalCoverageView extends InputViewBase {

    initialize(options) {
        this.mediator = options.mediator;
        this.bindEvents(this.mediator);
        this.config = options.config;
        if(this.config.useEdbDateRange === true) {
            this.requestDateRange();
        }
    }

    get template() {
        return _.template(viewTemplate);
    }

    get events() {
        return {
            'click .add-on': 'showDatepicker',
            'blur .combo-box-input': 'updateDateDisplay',
            'change .combo-box-input': 'updateDateDisplay'
        };
    }

    bindEvents(mediator) {
        mediator.on('app:home', this.onAppHome, this);
        mediator.on('dateRangeRequestComplete', this.onDateRangeRequestComplete, this);
    }

    onAppHome() {
        $('div.start-date').hide();
        $('input#start-date').hide();
        $('input#end-date').hide();
        this.render();
    }

    requestDateRange() {
        let trigger = this.mediator.trigger;

        // only make the request if we don't have the min and max dates
        if(datepickerOptions.minDate === null && datepickerOptions.maxDate === null) {
            $.ajax({
                dataType: 'json',
                // eslint-disable-next-line no-undef
                // TODO: Consider port
                url: this.config.provider.dateRangeHost + this.config.dateRangeQuery,
                success: function (data) {
                    trigger('dateRangeRequestComplete', data);
                }
            });
        }
    }

    onDateRangeRequestComplete(data, datepickerOptions) {
        const today = new Date();
        const minDate = format(data.start_date, 'yyyy-MM-dd');
        const maxDate = format(data.end_date,'yyyy-MM-dd');

        datepickerOptions.minDate = minDate;
        datepickerOptions.maxDate = today > maxDate ? today : maxDate;

        this.setupDatepicker(datepickerOptions);
    }

    render(startDate, endDate) {
        startDate = startDate || '';
        endDate = endDate || '';

        this.$el.html(this.template({ startDate: startDate, endDate: endDate }));

        tippy('div.start-date', _.extend({}, tippyOptions, { content: dateStatus.BAD_DATE_RANGE.message }));
        tippy('input#start-date', _.extend({}, tippyOptions, { content: dateStatus.BAD_FORMAT_START.message }));
        tippy('input#end-date', _.extend({}, tippyOptions, { content: dateStatus.BAD_FORMAT_END.message }));
        _.forEach(['div.start-date', 'input#start-date', 'input#end-date'], function (id) {
            this.$(id).addClass('temporal');
        }, this);

        this.setupDatepicker(datepickerOptions);

        return this;
    }

    setupDatepicker(datepickerOptions) {
        if (this.startDatepicker) {
            this.startDatepicker.destroy();
        }
        if (this.endDatepicker) {
            this.endDatepicker.destroy();
        }

        const startInput = $('input#start-date').get(0);
        this.startDatepicker = new Datepicker(startInput, _.extend({},
            datepickerOptions, {
                format: {
                    toValue: _.partial(toValue, startOfMonth, startOfYear),
                    toDisplay
                }
            }
        ));

        const endInput = $('input#end-date').get(0);
        this.endDatepicker = new Datepicker(endInput, _.extend({},
            datepickerOptions, {
                format: {
                    toValue: _.partial(toValue, endOfMonth, endOfYear),
                    toDisplay
                }
            }
        ));
    }

    showDatepicker(e) {
        if (e.target.parentElement.classList.contains('start-date')) {
            this.startDatepicker.show();
        } else if (e.target.parentElement.classList.contains('end-date')) {
            this.endDatepicker.show();
        }
    }

    updateDateDisplay() {
        let [valid, errors] = this.validate();
        this.hideAllDateErrors();
        if(!valid) {
            this.showDateError(_.first(errors));
        }
    }

    validate() {
        let startText = this.getInputField('start-date');
        let endText = this.getInputField('end-date');
        let startDate = this.startDatepicker.getDate();
        let endDate = this.endDatepicker.getDate();

        let valid = true;
        let errors = [];

        if (startText && !isValid(startDate)) {
            valid = false;
            errors.push(dateStatus.BAD_FORMAT_START);
        }

        if (endText && !isValid(endDate)) {
            valid = false;
            errors.push(dateStatus.BAD_FORMAT_END);
        }

        if (startText && endText && startDate > endDate) {
            valid = false;
            errors.push(dateStatus.BAD_DATE_RANGE);
        }

        return [valid, errors];
    }

    hideAllDateErrors() {
        _.each(dateStatus, function (value) {
            this.hideDateError(value);
        }, this);
    }

    showDateError(dateError) {
        this.$(dateError.element).attr('title', dateError.message).get(0)._tippy.show();
        this.$(dateError.element).focus();
        this.highlightInvalidInput(dateError.highlightElements);
    }

    hideDateError(dateError) {
        this.$(dateError.element).get(0)._tippy.hide();
        this.removeHighlighting(dateError.highlightElements);
    }

    removeHighlighting(elements) {
        _.each(elements, function (elementID) {
            $(elementID).removeClass('highlighting');
        });
    }

    highlightInvalidInput(elements) {
        _.each(elements, function (elementID) {
            $(elementID).addClass('highlighting');
        });
    }
}

export default TemporalCoverageView;
