/* jshint esversion: 6 */

import * as Backbone from 'backbone';
import _ from 'underscore';
import ResultsCountView from './ResultsCountView';
import viewTemplate from '../../../templates/right_column/results_header/results_header.html';

class ResultsHeaderView extends Backbone.View {
    initialize(options) {
        this.options = options;
        this.mediator = options.mediator;
        this.bindEvents(this.mediator);
    }

    bindEvents(mediator) {
        mediator.on('search:complete', this.render, this);
        mediator.on('search:complete', this.showControls, this);
        mediator.on('search:initiated', this.hideControls, this);
        mediator.on('search:displayPreviousResults', this.showControls, this);
        mediator.on('app:home', this.hideControls, this);
    }

    render() {
        this.$el.html(_.template(viewTemplate)());

        this.resultsCountView = new ResultsCountView({
            //   collection: this.options.searchResultsCollection
            el: this.$el.find('.results-count'),
            mediator: this.mediator
        }).render();

        // // do not render the results-per-page and sort-by dropdowns when there
        // // are 0 results
        // if (this.options.searchResultsCollection.getTotalResultsCount() !== 0) {
        //
        //   objectFactory.createInstance('SortResultsView', {
        //     el: this.$el.find('.sort-results'),
        //     collection: this.options.searchResultsCollection,
        //     model: this.options.searchParamsModel
        //   }).render();
        //
        //   objectFactory.createInstance('ResultsPerPageView', {
        //     el: this.$el.find('.results-per-page'),
        //     collection: this.options.searchResultsCollection,
        //     model: this.options.searchParamsModel
        //   }).render();
        //
        // }

        return this;
    }

    hideControls() {
        this.$el.addClass('hidden');
    }

    showControls() {
        this.$el.removeClass('hidden');
    }
}

export default ResultsHeaderView;
