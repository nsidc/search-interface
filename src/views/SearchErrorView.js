import Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../templates/search_error_view.html';

class SearchErrorView extends Backbone.View {
    initialize(options) {
        this.mediator = options.mediator;
        this.bindEvents(this.mediator);
    }

    render() {
        this.$el.html(_.template(viewTemplate)());
        return this;
    }

    bindEvents(mediator) {
        mediator.on('search:initiated', this.onSearchInitiated, this);
        mediator.on('search:error', this.onSearchError, this);
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
