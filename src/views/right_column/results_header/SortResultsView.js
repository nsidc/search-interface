import _ from 'underscore';
import viewTemplate from '../../../templates/right_column/results_header/sort_results_label.html';
import DropdownView from './DropdownView';

class SortResultsView extends DropdownView {

    get template() {
        return _.template(viewTemplate);
    }

    initialize(options) {
        // this.model = options.model;
        // this.collection = options.collection;
        this.updateParamsModel = this.model.setSortKeys;
        this.dropdownOptions = options.config.features.sortByOptions;
        this.mediator = options.mediator;
    }

    render() {
        DropdownView.prototype.render.call(this, this.template());
        return this;
    }

    getButtonId() {
        return 'sort-results';
    }

    getSelectedOption() {
        return this.collection.getSortKeys();
    }
}

export default SortResultsView;
