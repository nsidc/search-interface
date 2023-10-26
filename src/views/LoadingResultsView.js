import Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../templates/loading_results.html';

class LoadingResultsView extends Backbone.View {

    initialize(options) {
        if(options !== undefined) {
            this.mediator = options.mediator;
            this.mediator.on('search:initiated', this.onSearchInitiated, this);
            this.mediator.on('search:urlParams', this.onSearchInitiated, this);
            this.mediator.on('search:fullSearchComplete', this.onSearchDatasetsReturned, this);
            this.mediator.on('search:facetsReturned', this.onSearchFacetsReturned, this);
            this.mediator.on('search:refinedSearch', this.onSearchRefined, this);
            this.mediator.on('search:refinedSearchComplete', this.onSearchDatasetsReturned, this);
            this.mediator.on('search:noResults', this.hideLoadingResultsOverlay, this);
            this.mediator.on('search:error', this.hideLoadingResultsOverlay, this);
            this.mediator.on('app:home', this.onAppHome, this);
            this.mediator.on('search:success', this.onSearchSuccess, this);
        }

        this.datasetsReturned = true;
        this.facetsReturned = true;
        this.hideLoadingResultsOverlay();
    }

    render() {
        this.$el.html(_.template(viewTemplate)());
        return this;
    }

    onSearchInitiated() {
        this.datasetsReturned = false;
        this.facetsReturned = false;
        this.showLoadingResultsOverlay();
    }

    onSearchDatasetsReturned() {
        this.datasetsReturned = true;
        this.checkSearchComplete();
    }

    onSearchFacetsReturned() {
        this.facetsReturned = true;
        this.checkSearchComplete();
    }

    onSearchRefined() {
        this.showLoadingResultsOverlay("Filtering results...");
    }

    checkSearchComplete() {
        if (this.datasetsReturned && this.facetsReturned) {
            this.hideLoadingResultsOverlay();
        }
    }

    showLoadingResultsOverlay(msg = 'Performing Search...') {
        this.$el.removeClass('hidden');
        this.$('#loading-results-text').text(msg);
    }

    hideLoadingResultsOverlay() {
        this.$el.addClass('hidden');
    }

    onAppHome() {
        this.hideLoadingResultsOverlay();
    }

    onSearchSuccess() {
        this.showLoadingResultsOverlay("Loading Results...");
    }
}

export default LoadingResultsView;
