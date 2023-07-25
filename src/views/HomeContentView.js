import * as Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../templates/home_page.html';

class HomeContentView extends Backbone.View {

    get events() {
        return {
            'click .example-terms li': 'onClickExampleTerm',
            'click img#search-now': 'onStartSearchingClicked'
        };
    }

    initialize(options) {
        this.options = options;
        this.mediator = options.mediator;
        this.bindEvents(this.mediator);
    }

    bindEvents(mediator) {
        mediator.on('app:home', this.onAppHome, this);
        mediator.on('search:initiated', this.onSearchInitiated, this);
        mediator.on('search:urlParams', this.onSearchInitiated, this);
        mediator.on('search:facetsOnly', this.onSearchInitiated, this);
    }

    render() {
        this.$el.html(_.template(viewTemplate));
    }

    onAppHome() {
        this.show();
    }

    onSearchInitiated() {
        this.hide();
    }

    onStartSearchingClicked() {
        this.mediator.trigger('search:initiated', this.model);
    }

    onClickExampleTerm(event) {
        this.mediator.trigger('search:example', event.target.text);
    }

    show() {
        this.$el.removeClass('hidden');
    }

    hide() {
        this.$el.addClass('hidden');
    }
}

export default HomeContentView;
