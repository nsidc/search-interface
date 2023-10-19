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

        this.mediator.on('app:home', this.onAppHome, this);
        this.mediator.on('search:initiated', this.onSearchInitiated, this);
        this.mediator.on('search:urlParams', this.onSearchInitiated, this);
        this.mediator.on('search:facetsOnly', this.onSearchInitiated, this);
    }

    // bindEvents() {
    //     if (this.mediator === undefined || this.mediator === null) {
    //         return;
    //     }
    //     this.mediator.on('app:home', this.onAppHome, this);
    //     this.mediator.on('search:initiated', this.onSearchInitiated, this);
    //     this.mediator.on('search:urlParams', this.onSearchInitiated, this);
    //     this.mediator.on('search:facetsOnly', this.onSearchInitiated, this);
    // }
    //
    // setMediator(mediator) {
    //     this.mediator = mediator;
    //     this.bindEvents();
    // }

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
