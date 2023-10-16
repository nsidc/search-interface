import Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../templates/search_error_view.html';

class SearchErrorView extends Backbone.View {
    initialize(options) {
        this.mediator = options.mediator;
        this.bindEvents();
    }

    render() {
        this.$el.html(_.template(viewTemplate)());
        return this;
    }

    bindEvents() {
        if (this.mediator === undefined || this.mediator === null) {
            return;
        }
        this.mediator.on('search:initiated', this.onSearchInitiated, this);
        this.mediator.on('search:error', this.onSearchError, this);
    }

    setMediator(mediator) {
        this.mediator = mediator;
        this.bindEvents();
    }

    show() {
        this.$el.removeClass('hidden');
    }

    hide() {
        this.$el.addClass('hidden');
    }

    onSearchInitiated() {
        this.hide();
    }

    onSearchError() {
        this.show();
    }
}

export default SearchErrorView;
