import Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../templates/no_results.html';

class NoResultsView extends Backbone.View {
    initialize(options) {
        this.mediator = options.mediator;
        this.mediator.on('search:noResults', this.onNoResultsReturned, this);
        this.mediator.on('search:initiated', this.onSearchInitiated, this);
        this.mediator.on('search:refinedSearch', this.onSearchInitiated, this);
        this.mediator.on('search:displayPreviousResults', this.onDisplayPreviousResults, this);
        this.mediator.on('app:home', this.onAppHome, this);

        this.hideNoResultsMessage();
    }

    render() {
        this.$el.html(_.template(viewTemplate)());
        return this;
    }

    onNoResultsReturned() {
        this.showNoResultsMessage();
    }

    onSearchInitiated() {
        this.hideNoResultsMessage();
    }

    onDisplayPreviousResults() {
        this.hideNoResultsMessage();
    }

    onAppHome() {
        this.hideNoResultsMessage();
    }

    showNoResultsMessage() {
        this.$el.removeClass('hidden');
    }

    hideNoResultsMessage() {
        this.$el.addClass('hidden');
    }
}

export default NoResultsView;
