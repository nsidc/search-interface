import _ from 'underscore';
import $ from 'jquery';
import { format, getDaysInMonth, isValid, parse, toDate } from 'date-fns';
import InputViewBase from '../InputViewBase';
import viewTemplate from '../../templates/search_criteria/temporal_search.html';

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
        this.$(dateError.element).attr('title', dateError.message).tipsy('show');
        this.$(dateError.element).focus();
        this.highlightInvalidInput(dateError.highlightElements);
    }

    hideDateError(dateError) {
        this.$(dateError.element).tipsy('hide');
        this.removeHighlighting(dateError.highlightElements);
    }

    hideAllDateErrors() {
        _.each(dateStatus, function (value) {
            this.hideDateError(value);
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
            date.setMonth(11); // 0 is January, 11 is December
            date.setDate(31); // day is set relative to the first of December
        }
        // user typed in just '2014-04', give them '2014-04-30'
        else if(inputString.match(rYearMonthOnly)) {
            date.setDate(getDaysInMonth(date));
        }

        return date;
    }

    onBlurInput(e) {
        this.formatDateInput(e.target);
        this.updateDateErrorDisplay();
    }

    onAppHome() {
        // $('div.start-date').tipsy('hide');
        // $('input#start-date').tipsy('hide');
        // $('input#end-date').tipsy('hide');
        this.render();
    }

    // convert date format to YYYY-MM-DD, fill in full date if just year or year
    // and month is given
    formatDateInput(target) {
        let id = target.id,
            value = target.value,
            date = toDate(value),
            newDateValue;
        const dateFormat = 'yyyy-MM-dd';

        // TODO: What is an appropriate reference date?
        // if the date is invalid, try parsing it with a given format
        if(!isValid(date)) {
            date = parse(value, dateFormat, datepickerOptions.startDate);
        }

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
            this.hideAllDateErrors();
        }
        else {
            this.showDateError(this.getDateError());
        }
    }

    render(startDate, endDate) {
        //let tipsyOptions = {gravity: 'nw', trigger: 'manual', opacity: 1, className: 'temporal', html: true};

        if(startDate === undefined) {
            startDate = '';
        }
        if(endDate === undefined) {
            endDate = '';
        }

        this.$el.html(_.template(viewTemplate)({startDate: startDate, endDate: endDate}));
        // this.$el.html(this.template({ startDate: startDate, endDate: endDate }));

        // this.$('div.start-date').tipsy(tipsyOptions);
        // this.$('input#start-date').tipsy(tipsyOptions);
        // this.$('input#end-date').tipsy(tipsyOptions);

        //this.setupDatepicker(datepickerOptions);

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
        return date === '' || isValid(date);
    }
}

export default TemporalCoverageView;
