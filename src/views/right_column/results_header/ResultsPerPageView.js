import _ from 'underscore';
import viewTemplate from '../../../templates/right_column/results_header/results_per_page_label.html';
import DropdownView from './DropdownView';

class ResultsPerPageView extends DropdownView {
    get template() {
        return _.template(viewTemplate);
    }

    initialize(options) {
        const resultsPerPage = options.config.features.itemsPerPage;
        this.updateParamsModel = this.model.setItemsPerPage;
        this.dropdownOptions = _.object(resultsPerPage, resultsPerPage);
        this.mediator = options.mediator;
    }

    render() {
        DropdownView.prototype.render.call(this);
        this.$el.prepend(this.template());

        return this;
    }

    getButtonId() {
        return 'results-per-page';
    }

    getSelectedOption() {
        return this.collection.getItemsPerPage();
    }
}

export default ResultsPerPageView;
