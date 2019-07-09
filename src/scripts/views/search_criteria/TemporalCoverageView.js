define(['views/InputViewBase',
        'text!templates/search_criteria/temporal_search.html',
        'lib/mediator_mixin'],
        function (InputViewBase,
                  temporalTemplate,
                  mediatorMixin) {
  var TemporalCoverageView,
      dateStatus,
      datepickerOptions,
      dateIsValid;

  dateStatus = {
    VALID_DATES : {element: null},
    BAD_FORMAT_START : {
      element: 'input#start-date',
      highlightElements: ['input#start-date'],
      message: 'Please reformat your date to<br>yyyy-mm-dd'
    },
    BAD_FORMAT_END : {
      element: 'input#end-date',
      highlightElements: ['input#end-date'],
      message: 'Please reformat your date to<br>yyyy-mm-dd'
    },
    BAD_DATE_RANGE : {
      element: 'div.start-date',
      highlightElements: ['input#start-date', 'input#end-date'],
      message: 'Please change the dates so the start date is before the end date.'
    }
  };

  // https://github.com/nsidc/bootstrap-datepicker/blob/nsidc/docs/options.rst
  datepickerOptions = {
    minViewMode: 'days',
    autoclose: true,
    format: 'yyyy-mm-dd',
    startView: 'decade',
    showOnFocus: false,
    fillAsYouGo: true,
    startDate: null, // filled in once the catalog-services request is complete
    endDate: null
  };

  // in this view, the date inputs are valid if they are empty or if they
  // contain a date in the yyyy-mm-dd format
  dateIsValid = function (date) {
    return date === '' || moment(date, 'YYYY-MM-DD').isValid();
  };

  TemporalCoverageView = InputViewBase.extend({

    template: _.template(temporalTemplate),

    events: {
      'blur .combo-box-input' : 'onBlurInput',
      'change .combo-box-input' : 'onBlurInput'
    },

    bindEvents: function () {
      this.mediatorBind('app:home', this.onAppHome, this);
      this.mediatorBind('dateRangeRequestComplete', this.onDateRangeRequestComplete, this);
    },

    initialize: function (options) {
      this.bindEvents();
      if (options.useEdbDateRange === true) {
        this.requestDateRange();
      }
    },

    requestDateRange: function () {
      var trigger = this.mediatorTrigger;

      // only make the request if we don't have the start date and end date
      if (datepickerOptions.startDate === null && datepickerOptions.endDate === null) {
        $.ajax({
          dataType: 'json',
          url: window.location.origin + '/api/dataset/metadata/dateRange',
          success: function (data) {
            trigger('dateRangeRequestComplete', data);
          }
        });
      }
    },

    highlightInvalidInput: function (elements) {
      _.each(elements, function (elementID) {
        $(elementID).addClass('highlighting');
      });
    },

    removeHighlighting: function (elements) {
      _.each(elements, function (elementID) {
        $(elementID).removeClass('highlighting');
      });
    },

    showDateError: function (dateError) {
      // display only one error at a time
      this.hideAllDateErrors();

      // if the error has an associated input element, highlight the element
      this.$(dateError.element).attr('title', dateError.message).tipsy('show');
      this.$(dateError.element).focus();
      this.highlightInvalidInput(dateError.highlightElements);
    },

    hideDateError: function (dateError) {
      this.$(dateError.element).tipsy('hide');
      this.removeHighlighting(dateError.highlightElements);
    },

    hideAllDateErrors: function () {
      _.each(dateStatus, function (value) {
        this.hideDateError(value);
      }, this);
    },

    getDateError: function () {
      var startDate = this.getInputField('start-date'),
          endDate = this.getInputField('end-date');

      if (!dateIsValid(startDate)) {
        return dateStatus.BAD_FORMAT_START;
      }

      if (!dateIsValid(endDate)) {
        return dateStatus.BAD_FORMAT_END;
      }

      if (startDate > endDate && startDate.length > 0 && endDate.length > 0) {
        return dateStatus.BAD_DATE_RANGE;
      }

      return dateStatus.VALID_DATES;
    },

    isValid: function () {
      var startDate = this.getInputField('start-date'),
          endDate = this.getInputField('end-date'),
          rangeValid,
          onlyOneDateEntered;

      rangeValid = startDate <= endDate;
      onlyOneDateEntered = startDate.length === 0 || endDate.length === 0;

      return dateIsValid(startDate) &&
             dateIsValid(endDate) &&
             (rangeValid || onlyOneDateEntered);
    },

    // partial start-dates are handled nicely by moment, but we need to fix
    // missing end date info manually
    adjustEndDate: function (date, inputString) {
      var year = date.year(),
          month,
          day,
          rYearOnly = /^[0-9]{4}\-?$/,
          rYearMonthOnly = /^[0-9]{4}\-[0-9]{1,2}\-?$/,
          partialEntered = false;

      // user typed in just '2014', give them '2014-12-31'
      if (inputString.match(rYearOnly)) {
        partialEntered = true;
        month = 11; // in moment, 0 is January, 11 is December
        day = 31;

      // user typed in just '2014-04', give them '2014-04-30'
      } else if (inputString.match(rYearMonthOnly)) {
        partialEntered = true;
        month = date.month();
        day = date.daysInMonth();
      }

      // don't create new date object if user typed in '2014-04-02'
      if (partialEntered) {
        date = moment({
          year: year,
          month: month,
          day: day
        });
      }

      return date;
    },

    onBlurInput: function (e) {
      this.formatDateInput(e.target);
      this.updateDateErrorDisplay();
    },

    onAppHome: function () {
      $('div.start-date').tipsy('hide');
      $('input#start-date').tipsy('hide');
      $('input#end-date').tipsy('hide');
      this.render();
    },

    // convert date format to YYYY-MM-DD, fill in full date if just year or year
    // and month is given
    // TODO: May need to update this to manually fix "bad" dates rather than throwing
    // it to "moment", as this functionality is deprecated and may be removed.
    formatDateInput: function (target) {
      var id = target.id,
          value = target.value,
          date = moment.utc(value),
          newDateValue;

      // if the date is invalid, try parsing it with a given format; in Firefox
      //   30.0, Moment.js 2.5.1 can't parse 950-01-01 without the format
      //   string, causing an error message to be displayed when a 3 digit year
      //   is selected from the datepicker
      if (!date.isValid()) {
        date = moment.utc(value, 'YYYY-MM-DD');
      }

      if (id === 'end-date') {
        date = this.adjustEndDate(date, value);
      }

      newDateValue = date.format('YYYY-MM-DD');

      // if the date is invalid, moment.format() returns 'Invalid date'
      if (newDateValue !== 'Invalid date') {
        this.setInputField(id, newDateValue);
      }

    },

    updateDateErrorDisplay: function () {
     if (this.isValid()) {
        this.hideAllDateErrors();
      } else {
        this.showDateError(this.getDateError());
      }
    },

    render: function (startDate, endDate) {
      var tipsyOptions = {gravity: 'nw', trigger: 'manual', opacity: 1, className: 'temporal', html: true};

      if (startDate === undefined) {
        startDate = '';
      }
      if (endDate === undefined) {
        endDate = '';
      }

      this.$el.html(this.template({ startDate: startDate, endDate: endDate }));

      this.$('div.start-date').tipsy(tipsyOptions);
      this.$('input#start-date').tipsy(tipsyOptions);
      this.$('input#end-date').tipsy(tipsyOptions);

      this.setupDatepicker(datepickerOptions);

      return this;
    },

    setupDatepicker: function (datepickerOptions) {
      this.$('.start-date').datepicker('destroy');
      this.$('.end-date').datepicker('destroy');

      this.$('.start-date').datepicker(datepickerOptions);
      this.$('.end-date').datepicker(_.extend({
        defaultDay: 'last',
        defaultMonth: 11
      }, datepickerOptions));
    },

    onDateRangeRequestComplete: function (data) {
      var today = moment().format('YYYY-MM-DD'),
          startDate = moment.utc(data.start_date).format('YYYY-MM-DD'),
          endDate = moment.utc(data.end_date).format('YYYY-MM-DD');

      datepickerOptions.startDate = startDate;
      datepickerOptions.endDate = today > endDate ? today : endDate;

      this.setupDatepicker(datepickerOptions);
    }

  });

  _.extend(TemporalCoverageView.prototype, mediatorMixin);

  return TemporalCoverageView;
});
