import 'tippy.js/dist/tippy.css'
import 'bootstrap-datepicker';
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker.standalone.css';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isValid, parse } from 'date-fns';
import _ from 'underscore';
import $ from 'jquery';
import tippy from 'tippy.js';
import InputViewBase from '../InputViewBase';
import viewTemplate from '../../templates/search_criteria/temporal_search.html';


/**
 * Attempts to parse manually-entered dates, completing them with a month or day 
 * (if necessary) using the provided completion functions. This function is
 * passed to and used by the datepicker components.
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
            let adjustedDate = new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0));
            console.log(`toValue adjustedDate: ${adjustedDate}`);
            return adjustedDate;
        });

    return _.first(_.filter(dates, isValid)) || _.first(dates);
}

/**
 * Formats a valid Date as a textual representation, e.g., 2010-03-31. This
 * function is passed to and used by the datepicker components.
 */
function toDisplay(date) {
    return format(date, 'yyyy-MM-dd');
}

// https://github.com/nsidc/bootstrap-datepicker/blob/nsidc/docs/options.rst
const datepickerOptions = {
    autoclose: true,
    immediateUpdates: false,
    startDate: null, // filled in once the catalog-services request is complete
    endDate: null,
    startView: 'decade',
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

    onDateRangeRequestComplete(data, datepickerOptions) {
        const today = new Date();
        const startDate = format(data.start_date, 'yyyy-MM-dd');
        const endDate = format(data.end_date,'yyyy-MM-dd');

        datepickerOptions.startDate = startDate;
        datepickerOptions.endDate = today > endDate ? today : endDate;

        this.setupDatepicker(datepickerOptions);
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
            /* TODO: Default to today */
        }}); 
        this.$('.end-date').datepicker({ ...datepickerOptions, ...{
            format: {
                toValue: _.partial(toValue, endOfMonth, endOfYear),
                toDisplay
            },
            /* TODO: Default to end of year */
            defaultDay: 'last',
            defaultMonth: 11
        }});
    }

    updateDateDisplay(e) {
        let id = e.target.id;
        const date = this.$(`.${id}`).datepicker('getDate');
        if (isValid(date)) {
            this.setInputField(id, format(date, 'yyyy-MM-dd'));
        }
        
        let [valid, errors] = this.validate();
        this.hideAllDateErrors();
        if(!valid) {
            this.showDateError(_.first(errors));
        }
    }

    validate() {
      let startText = this.getInputField('start-date');
      let endText = this.getInputField('end-date');
      let startDate = _.partial(toValue, startOfMonth, startOfYear)(startText);
      let endDate = _.partial(toValue, endOfMonth, endOfYear)(endText);
      let startD = this.$('.start-date').datepicker('getDate');
      let endD = this.$('.end-date').datepicker('getDate');

      console.log(`Trying to validate:\n (${startText}) (${endText})\n (${startDate}) (${endDate})\n (${startD}) (${endD})`);

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

      console.log(`The attempted validation results: (${valid})`);
      console.log(`The attempted validation errors: (${errors})`);
      
      return [valid, errors];
    }

    hideAllDateErrors() {
        _.each(dateStatus, function (value) {
            if (value.element !== null) {
              this.hideDateError(value);
            }
        }, this);
    }

    showDateError(dateError) {
        console.log(dateError);
        // if the error has an associated input element, highlight the element
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
