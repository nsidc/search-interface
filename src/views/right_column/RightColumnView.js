import * as Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../../templates/right_column/right_column.html';
import ResultsHeaderView from './results_header/ResultsHeaderView';
import ResultsFooterView from './results_footer/ResultsFooterView';
import SearchResultsView from './SearchResultsView';

class RightColumnView extends Backbone.View {

    initialize(options) {
        this.options = options;
        this.mediator = options.mediator;
        this.bindEvents(this.mediator);
    }

    bindEvents(mediator) {
        // Render both when the new search is submitted (to show the user what
        // they searched for is being worked on) and when the results are
        // returned (params may have been corrected or normalized)
        mediator.on('search:initiated', this.hideView, this);
        mediator.on('search:urlParams', this.hideView, this);
        mediator.on('search:complete', this.onSearchComplete, this);
        mediator.on('search:displayPreviousResults', this.onDisplayPreviousResults, this);
        mediator.on('search:refinedSearch', this.onSearchRefined, this);
        mediator.on('search:noResults', this.hideView, this);
        mediator.on('search:resetClear', this.hideView, this);
        mediator.on('app:home', this.onAppHome, this);
    }

    render() {
        this.$el.html(_.template(viewTemplate)());

        new ResultsHeaderView({
            config: this.options.config,
            searchParamsModel: this.options.searchParamsModel,
            searchResultsCollection: this.options.searchResultsCollection,
            el: this.$el.find('.results-header'),
            mediator: this.mediator
        }).render();

        new SearchResultsView({
            config: this.options.config,
            el: this.$el.find('#results')[0],
            collection: this.options.searchResultsCollection,
            mediator: this.mediator
        }).render();

        new ResultsFooterView({
            el: this.$el.find('.results-footer'),
            searchParamsModel: this.options.searchParamsModel,
            searchResultsCollection: this.options.searchResultsCollection,
            mediator: this.mediator
        }).render();
    }

    hide(id) {
        this.$el.find(id).addClass('hidden');
    }

    show(id) {
        this.$el.find(id).removeClass('hidden');
    }

    onDisplayPreviousResults() {
        this.show('#current-results');
    }

    hideView() {
        this.hide('#current-results');
    }

    onSearchComplete() {
        this.show('#current-results');
    }

    onSearchRefined() {
        this.hide('#current-results');
    }

    onAppHome() {
        this.hide('#current-results');
    }
}

export default RightColumnView;
