import Backbone from 'backbone';
import _ from 'underscore';
import $ from 'jquery';
// TODO: Fully replace the bootstrap dropdown with a basic dropdown or
// simple component.
// import 'bootstrap/dist/css/bootstrap.min.css';
import mainTemplate from '../../../templates/right_column/results_header/dropdown_view.html';
import optionTemplate from '../../../templates/right_column/results_header/dropdown_option.html';
import dividerTemplate from '../../../templates/li-divider.html';

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
            divider: _.template(dividerTemplate),
            option: _.template(optionTemplate)
        };
    }

    get events() {
        return {
            'click .dropdown-menu a': 'onChangeSelection'
        };
    }

    render() {
        this.$el.html(this.templates.main({
            selectedOption: this.getSelectedOption(),
            buttonId: this.getButtonId()
        }));
        this.renderDropdown();

        return this;
    }

    renderDropdown() {
        const $dropdown = this.$el.find('ul.dropdown-menu');

        const dropdownOptionsHtml = _.map(this.dropdownOptions, function (value, key) {
            return this.templates.option({
                displayValue: value,
                opensearchValue: key
            });
        }, this).join(this.templates.divider());

        $dropdown.html(dropdownOptionsHtml);
    }

    onChangeSelection(ev) {
        const opensearchValue = $(ev.currentTarget).attr('data-opensearch-value');
        this.updateParamsModel.call(this.model, opensearchValue);
        this.mediator.trigger('search:refinedSearch', this.model);
    }

}

export default DropdownView;
