import Backbone from 'backbone';
import _ from 'underscore';
import $ from 'jquery';
import 'jquery-ui/themes/base/all.css';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/selectmenu';
import mainTemplate from '../../../templates/right_column/results_header/dropdown_view.html';
import optionTemplate from '../../../templates/right_column/results_header/dropdown_option.html';

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
class DropdownView extends Backbone.View {

    get templates() {
        return {
            main: _.template(mainTemplate),
            option: _.template(optionTemplate)
        };
    }

    render(labelElement) {
        this.$el.html(this.templates.main({
            labelElement,
            selectedOption: this.getSelectedOption(),
            buttonId: this.getButtonId()
        }));
        this.renderDropdown();

        const dropdown = this.$el.find('select');
        dropdown.selectmenu({
            change: _.bind(this.onChangeSelection, this)
        });

        return this;
    }

    renderDropdown() {
        const selectedOption = this.getSelectedOption();
        const $dropdown = this.$el.find('select');

        const dropdownOptionsHtml = _.map(this.dropdownOptions, function (value, key) {
            let selected = (selectedOption === value);
            return this.templates.option({
                selected,
                displayValue: value,
                opensearchValue: key
            });
        }, this);

        $dropdown.html(dropdownOptionsHtml);
    }

    onChangeSelection(event, ui) {
        const opensearchValue = ui.item.value;
        this.updateParamsModel.call(this.model, opensearchValue);
        this.mediator.trigger('search:refinedSearch', this.model);
    }

}

export default DropdownView;
