import Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../templates/no_results.html';

class NoResultsView extends Backbone.View {
    initialize(options) {
        this.mediator = options.mediator;
        this.bindEvents();

        this.hideNoResultsMessage();
    }

    bindEvents() {
        if (this.mediator === undefined || this.mediator === null) {
            return;
        }
        this.mediator.on('search:noResults', this.onNoResultsReturned, this);
        this.mediator.on('search:initiated', this.onSearchInitiated, this);
        this.mediator.on('search:refinedSearch', this.onSearchInitiated, this);
        this.mediator.on('search:displayPreviousResults', this.onDisplayPreviousResults, this);
        this.mediator.on('app:home', this.onAppHome, this);
    }

    setMediator(mediator) {
        this.mediator = mediator;
        this.bindEvents();
    }

    render() {
        console.log(_.template(viewTemplate)());
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
