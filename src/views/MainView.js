/* jshint esversion: 6 */

import Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../templates/main_view.html';
import messageTemplate from '../templates/content_explanation_message.html';
//import AlertMessageView from './AlertMessageView';
//import NoResultsView from './NoResultsView';

class MainView extends Backbone.View {
    // TODO: Does this need to be a getter?
    get template() {
        return _.template(viewTemplate);
    }

    get message() {
        return _.template(messageTemplate);
    }

    initialize(options) {
        this.mediator = options.mediator;
        this.bindEvents(this.mediator);
    }

    addEnvironmentToTitle() {
        var url, envStart, envEnd, env;

        url = document.URL;

        envStart = url.indexOf('//') + 2;
        envEnd = url.indexOf('.', envStart);

        env = url.substring(envStart, envEnd);

        if(env !== 'nsidc') {
            document.title = document.title + ' - ' + env;
        }
    }

    bindEvents(mediator) {
        mediator.on('search:initiated', this.onNewSearchInitiated, this);
        mediator.on('search:resetClear', this.onClearSearch, this);
    }

    onNewSearchInitiated() {
        window.scrollTo(0, 0);
        this.removeContentExplanationMessage();
    }

    onClearSearch() {
        this.removeContentExplanationMessage();
        this.$el.find('#content').append(this.message({text: 'Your search has been reset.  Please perform a new search.'}));
    }

    removeContentExplanationMessage() {
        const messageElement = this.$el.find('#content-explanation-message');
        if(typeof messageElement !== 'undefined') {
            messageElement.remove();
        }
    }

    render() {
        this.addEnvironmentToTitle();

        this.$el.html(this.template());

        //   objectFactory.createInstance('MainHeaderView', {
        //     el : this.$el.find('.search-header'),
        //     searchParamsModel: this.options.searchParamsModel,
        //     searchResultsCollection: this.options.searchResultsCollection,
        //     facetsCollection: this.options.facetsCollection
        //   }).render();
        //
        //   objectFactory.createInstance('LeftColumnView', {
        //     el : this.$el.find('#left-column'),
        //     searchParamsModel: this.options.searchParamsModel,
        //     resultsCollection: this.options.searchResultsCollection,
        //     facetsCollection: this.options.facetsCollection
        //   }).render();
        //
        //   objectFactory.createInstance('HomeContentView', {
        //     el : this.$el.find('#home-page'),
        //     facetsCollection: this.options.facetsCollection,
        //     model: this.options.searchParamsModel
        //   }).render();
        //
        //   objectFactory.createInstance('LoadingResultsView', {
        //     el : this.$el.find('#loading-results'),
        //     resultsCollection: this.options.searchResultsCollection,
        //     searchParamsModel: this.options.searchParamsModel
        //   }).render();
        //
        //   new NoResultsView({
        //     el: this.$el.find('#no-results')
        //   }).render();
        //
        //   new AlertMessageView({
        //     el: this.$el.find('#alert-placeholder')
        //   }).render();
        //
        //   objectFactory.createInstance('RightColumnView', {
        //     el: this.$el.find('#right-column'),
        //     collection : this.collection,
        //     searchParamsModel: this.options.searchParamsModel,
        //     searchResultsCollection: this.options.searchResultsCollection
        //   }).render();
        //
        //   objectFactory.createInstance('SearchErrorView', {
        //     el: this.$el.find('#search-error')[0]
        //   }).render();
        //
        //   return this;
        // }
    }
}

export default MainView;
