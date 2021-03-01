import * as Backbone from 'backbone';
import _ from 'underscore';
import PaginationControlsView from './PaginationControlsView';
import viewTemplate from '../../../templates/right_column/results_footer_view.html';

class ResultsFooterView extends Backbone.View {
    get templates() {
        return {
            footer: _.template(viewTemplate)
        };
    }

    get tagName() {
        return 'div';
    }

    get className() {
        return 'results-footer';
    }

    initialize(options) {
        this.options = options;
        this.mediator = options.mediator;
    }

    render() {

        this.$el.html(this.templates.footer());

        new PaginationControlsView({
            mediator: this.mediator,
            el: this.$el.find('.pagination'),
            model: this.options.searchParamsModel,
            collection: this.options.searchResultsCollection
        }).render();

        return this;
    }
}

export default ResultsFooterView;
