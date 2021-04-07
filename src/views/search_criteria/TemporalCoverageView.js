import _ from 'underscore';
import $ from 'jquery';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { endOfMonth, endOfYear, format, getDaysInMonth, isValid, parse, parseISO, toDate } from 'date-fns';
import InputViewBase from '../InputViewBase';
import viewTemplate from '../../templates/search_criteria/temporal_search.html';
import 'bootstrap-datepicker';
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker.standalone.css';

// https://github.com/nsidc/bootstrap-datepicker/blob/nsidc/docs/options.rst
const datepickerOptions = {
    minViewMode: 'days',
    autoclose: true,
    format: 'yyyy-mm-dd',
    startView: 'decade',
    showOnFocus: false,
    fillAsYouGo: true,
    startDate: null, // filled in once the catalog-services request is complete
    endDate: null
};

const dateStatus = {
    VALID_DATES: {element: null},
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

    get events() {
        return {
            'blur .combo-box-input': 'onBlurInput',
            'change .combo-box-input': 'onBlurInput'
        };
    }

    get template() {
        return _.template(viewTemplate);
    }

    bindEvents(mediator) {
      mediator.on('app:home', this.onAppHome, this);
      mediator.on('dateRangeRequestComplete', this.onDateRangeRequestComplete, this);
    }

    initialize(options) {
        this.mediator = options.mediator;
        this.bindEvents(this.mediator);
        this.config = options.config;
        if(this.config.useEdbDateRange === true) {
            this.requestDateRange();
        }
    }

    requestDateRange() {
        let trigger = this.mediator.trigger;

        // only make the request if we don't have the start date and end date
        if(datepickerOptions.startDate === null && datepickerOptions.endDate === null) {
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

    highlightInvalidInput(elements) {
        _.each(elements, function (elementID) {
            $(elementID).addClass('highlighting');
        });
    }

    removeHighlighting(elements) {
        _.each(elements, function (elementID) {
            $(elementID).removeClass('highlighting');
        });
    }

    showDateError(dateError) {
        // display only one error at a time
        this.hideAllDateErrors();

        // if the error has an associated input element, highlight the element
        // TODO: Replace tipsy with tippy (already done for Facets)
        this.$(dateError.element).attr('title', dateError.message).get(0)._tippy.show();
        this.$(dateError.element).focus();
        this.highlightInvalidInput(dateError.highlightElements);
    }

    hideDateError(dateError) {
        this.$(dateError.element).get(0)._tippy.hide();
        this.removeHighlighting(dateError.highlightElements);
    }

    hideAllDateErrors() {
        _.each(dateStatus, function (value) {
            if (value.element !== null) {
              this.hideDateError(value);
            }
        }, this);
    }

    getDateError() {
        let startDate = this.getInputField('start-date'),
            endDate = this.getInputField('end-date');

        if(!this.dateIsValid(startDate)) {
            return dateStatus.BAD_FORMAT_START;
        }

        if(!this.dateIsValid(endDate)) {
            return dateStatus.BAD_FORMAT_END;
        }

        if(startDate > endDate && startDate.length > 0 && endDate.length > 0) {
            return dateStatus.BAD_DATE_RANGE;
        }

        return dateStatus.VALID_DATES;
    }

    isValidDateRange() {
        let startDate = this.getInputField('start-date'),
            endDate = this.getInputField('end-date'),
            rangeValid,
            onlyOneDateEntered;

        rangeValid = startDate <= endDate;
        onlyOneDateEntered = startDate.length === 0 || endDate.length === 0;

        return this.dateIsValid(startDate) &&
            this.dateIsValid(endDate) &&
            (rangeValid || onlyOneDateEntered);
    }

    // Fix missing end date info manually.
    // Assumes at least a year value was entered.
    adjustEndDate(date, inputString) {
        const rYearOnly = /^[0-9]{4}\-?$/;
        const rYearMonthOnly = /^[0-9]{4}\-[0-9]{1,2}\-?$/;

        // user typed in just '2014', give them '2014-12-31'
        if(inputString.match(rYearOnly)) {
            date = endOfYear(date);
            // date.setMonth(11); // 0 is January, 11 is December
            // date.setDate(31); // day is set relative to the first of December
        }
        // user typed in just '2014-04', give them '2014-04-30'
        else if(inputString.match(rYearMonthOnly)) {
            date = endOfMonth(date);
            // date.setDate(getDaysInMonth(date));
        }

        return date;
    }

    onBlurInput(e) {
        this.formatDateInput(e.target);
        this.updateDateErrorDisplay();
    }

    onAppHome() {
        $('div.start-date').hide();
        $('input#start-date').hide();
        $('input#end-date').hide();
        this.render();
    }

    // convert date format to YYYY-MM-DD, fill in full date if just year or year
    // and month is given
    formatDateInput(target) {
        let id = target.id,
            value = target.value,
            newDateValue;
        const dateFormat = 'yyyy-MM-dd';

        // TODO: What is an appropriate reference date?
        let date = parse(value, dateFormat, datepickerOptions.startDate);

        if(id === 'end-date' && isValid(date)) {
            date = this.adjustEndDate(date, value);
        }

        newDateValue = toDate(date);

        if(isValid(newDateValue)) {
            this.setInputField(id, newDateValue);
        }

    }

    updateDateErrorDisplay() {
        if(this.isValidDateRange()) {
            console.log('whiz');
            this.hideAllDateErrors();
        }
        else {
            console.log('bang');
            this.showDateError(this.getDateError());
        }
    }

    render(startDate, endDate) {
        let tippyOptions = {placement: 'top-start', trigger: 'manual', allowHTML: true};
        // className: 'temporal', 

        if(startDate === undefined) {
            startDate = '';
        }
        if(endDate === undefined) {
            endDate = '';
        }

        this.$el.html(this.template({ startDate: startDate, endDate: endDate }));

        // this.$('div.start-date').tipsy(tipsyOptions);
        // this.$('input#start-date').tipsy(tipsyOptions);
        // this.$('input#end-date').tipsy(tipsyOptions);
        tippy('div.start-date', { ...tippyOptions, content: dateStatus.BAD_DATE_RANGE.message });
        tippy('input#start-date', { ...tippyOptions, content: dateStatus.BAD_FORMAT_START.message });
        tippy('input#end-date', { ...tippyOptions, content: dateStatus.BAD_FORMAT_END.message });

        this.setupDatepicker(datepickerOptions);

        return this;
    }

    setupDatepicker(datepickerOptions) {
        this.$('.start-date').datepicker('destroy');
        this.$('.end-date').datepicker('destroy');

        this.$('.start-date').datepicker(datepickerOptions);
        this.$('.end-date').datepicker(_.extend({
            defaultDay: 'last',
            defaultMonth: 11
        }, datepickerOptions));
    }

    onDateRangeRequestComplete(data, datepickerOptions) {
        const today = new Date();
        const startDate = format(data.start_date, 'yyyy-MM-dd');
        const endDate = format(data.end_date,'yyyy-MM-dd');

        datepickerOptions.startDate = startDate;
        datepickerOptions.endDate = today > endDate ? today : endDate;

        this.setupDatepicker(datepickerOptions);
    }

    // in this view, the date inputs are valid if they are empty or if they
    // contain a date in the yyyy-mm-dd format
    dateIsValid(date) {
        const parsed = parse(date, 'yyyy-MM-dd', new Date());
        // console.log(`${date} => ${format(parsed, 'yyyy-MM-dd')}`);
        console.log(`${date} -=> ${parsed}`);
        return date === '' || isValid(parsed);
    }
}

export default TemporalCoverageView;
