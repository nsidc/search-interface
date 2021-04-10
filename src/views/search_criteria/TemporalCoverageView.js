import _ from 'underscore';
import $ from 'jquery';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isValid, parse } from 'date-fns';
import InputViewBase from '../InputViewBase';
import viewTemplate from '../../templates/search_criteria/temporal_search.html';
import 'bootstrap-datepicker';
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker.standalone.css';


function toValue(dayCompletion, monthDayCompletion, date) {
    const dateFormats = [
        ['yyyy-MM-dd', _.identity],
        ['yyyy-MM', dayCompletion],
        ['yyyy', monthDayCompletion]
    ];

    const dates = _.map(dateFormats,
        function ([format, completion]) {
            let parsed = completion(parse(date, format, new Date()));
            return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0);
        });

    return _.first(_.filter(dates, isValid)) || _.first(dates);
}

function toDisplay(date) {
    return format(date, 'yyyy-MM-dd');
}

// https://github.com/nsidc/bootstrap-datepicker/blob/nsidc/docs/options.rst
const datepickerOptions = {
    autoclose: true,
    immediateUpdates: true,
    startDate: null, // filled in once the catalog-services request is complete
    endDate: null,
    startView: 'years',
    minViewMode: 'days',
    showOnFocus: false,
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
            'blur .combo-box-input': 'updateDateDisplay',
            'change .combo-box-input': 'updateDateDisplay'
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
        let startDate = this.$('.start-date').datepicker('getDate');
        let endDate = this.$('.end-date').datepicker('getDate');

        if(!isValid(startDate)) {
            return dateStatus.BAD_FORMAT_START;
        }

        if(!isValid(endDate)) {
            return dateStatus.BAD_FORMAT_END;
        }

        if(startDate > endDate && startDate.length > 0 && endDate.length > 0) {
            return dateStatus.BAD_DATE_RANGE;
        }

        return dateStatus.VALID_DATES;
    }

    isValidDateRange() {
        let startDateValue = this.getInputField('start-date');
        let endDateValue = this.getInputField('end-date');
        let startDate = _.partial(toValue, startOfMonth, startOfYear)(startDateValue);
        let endDate = _.partial(toValue, endOfMonth, endOfYear)(endDateValue);
        console.log(startDateValue, endDateValue, startDate, endDate);
        let ivdr = (startDateValue && !endDateValue && isValid(startDate)) ||
            (!startDateValue && endDateValue && isValid(endDate)) ||
            (isValid(startDate) && isValid(endDate) && startDate <= endDate);
        console.log(ivdr);
        return ivdr;
    }

    onAppHome() {
        $('div.start-date').hide();
        $('input#start-date').hide();
        $('input#end-date').hide();
        this.render();
    }

    updateDateDisplay(e) {
        let id = e.target.id;
        const date = this.$(`.${id}`).datepicker('getDate');
        if (isValid(date)) {
            this.setInputField(id, format(date, 'yyyy-MM-dd'));
        }
        
        if(this.isValidDateRange()) {
            this.hideAllDateErrors();
        }
        else {
            this.showDateError(this.getDateError());
        }
    }

    render(startDate, endDate) {
        startDate = startDate || '';
        endDate = endDate || '';

        this.$el.html(this.template({ startDate: startDate, endDate: endDate }));

        let tippyOptions = {placement: 'top-start', trigger: 'manual', allowHTML: true};
        tippy('div.start-date', { ...tippyOptions, content: dateStatus.BAD_DATE_RANGE.message });
        tippy('input#start-date', { ...tippyOptions, content: dateStatus.BAD_FORMAT_START.message });
        tippy('input#end-date', { ...tippyOptions, content: dateStatus.BAD_FORMAT_END.message });
        _.forEach(['div.start-date', 'input#start-date', 'input#end-date'], function (id) {
            this.$(id).addClass('temporal');
        }, this);

        this.setupDatepicker(datepickerOptions);

        return this;
    }

    setupDatepicker(datepickerOptions) {
        this.$('.start-date').datepicker('destroy');
        this.$('.end-date').datepicker('destroy');

        this.$('.start-date').datepicker({ ...datepickerOptions, ...{
            format: {
                toValue: _.partial(toValue, startOfMonth, startOfYear),
                toDisplay
            }
        }}); 
        this.$('.end-date').datepicker({ ...datepickerOptions, ...{
            format: {
                toValue: _.partial(toValue, endOfMonth, endOfYear),
                toDisplay
            },
            defaultDay: 'last',
            defaultMonth: 11
        }});
    }

    onDateRangeRequestComplete(data, datepickerOptions) {
        const today = new Date();
        const startDate = format(data.start_date, 'yyyy-MM-dd');
        const endDate = format(data.end_date,'yyyy-MM-dd');

        datepickerOptions.startDate = startDate;
        datepickerOptions.endDate = today > endDate ? today : endDate;

        this.setupDatepicker(datepickerOptions);
    }
}

export default TemporalCoverageView;
