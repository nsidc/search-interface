define(
  [
    'lib/mediator_mixin',
    'text!templates/li-divider.html',
    'text!templates/right_column/results_header/dropdown_option.html',
    'text!templates/right_column/results_header/dropdown_view.html'
  ],
  function (
    mediatorMixin,
    dividerTemplate,
    optionTemplate,
    mainTemplate
  ) {

    var DropdownView;

    // subclasses of DropdownView must define the following methods and properties:
    //
    //   getButtonId() - id of the button acting as the main dropdown element
    //
    //   initialize() - set the needed options, any setup specific to the
    //                  subclass
    //
    //   dropdownOptions - object containing the information to be displayed as
    //                     options in the dropdown; keys are the OpenSearch
    //                     parameters, values are the displayed text
    //
    //   model - the Backbone model associated with view, most likely
    //           SearchParamsModel, defined when the view is created
    //
    //   updateParamsModel - the function of SearchParamsModel to call when an
    //                       option from the dropdown is selected
    //
    DropdownView = Backbone.View.extend({

      templates: {
        main: _.template(mainTemplate),
        divider: _.template(dividerTemplate),
        option: _.template(optionTemplate)
      },

      events: {
        'click .dropdown-menu a': 'onChangeSelection'
      },

      render: function () {
        this.$el.html(this.templates.main({
          selectedOption: this.getSelectedOption(),
          buttonId: this.getButtonId()
        }));
        this.renderDropdown();

        return this;
      },

      renderDropdown: function () {
        var $dropdown,
            dropdownOptionsHtml;

        $dropdown = this.$el.find('ul.dropdown-menu');

        dropdownOptionsHtml = _.map(this.dropdownOptions, function (value, key) {
          return this.templates.option({
            displayValue: value,
            opensearchValue: key
          });
        }, this).join(this.templates.divider());

        $dropdown.html(dropdownOptionsHtml);
      },

      onChangeSelection: function (ev) {
        var opensearchValue;

        opensearchValue = $(ev.currentTarget).attr('data-opensearch-value');
        this.updateParamsModel.call(this.model, opensearchValue);
        this.mediatorTrigger('search:refinedSearch', this.model);
      }

    });

    _.extend(DropdownView.prototype, mediatorMixin);

    return DropdownView;

  });
