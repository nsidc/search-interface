import * as Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../../../templates/right_column/results_header/total_results_count.html';

class ResultsCountView extends Backbone.View {
    initialize(options) {
        this.mediator = options.mediator;
        this.mediator.on('search:complete', this.render, this);
    }

    render() {
        let first,
            last,
            pageNumber,
            perPage,
            totalResults;

        pageNumber = this.collection.getPageNumber();
        perPage = this.collection.getItemsPerPage();
        totalResults = this.collection.getTotalResultsCount();

        first = 1 + perPage * (pageNumber - 1);
        last = Math.min(first - 1 + perPage, totalResults);

        this.$el.html(_.template(viewTemplate)({
            first: first,
            last: last,
            totalResults: totalResults
        }));

        return this;
    }
}

export default ResultsCountView;
