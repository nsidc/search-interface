/* jshint esversion: 6 */

import Backbone from 'backbone';
import _ from 'underscore';
import AlertMessageView from './AlertMessageView';
import AttributionView from './AttributionView';
import HeaderView from './HeaderView';
import HomeContentView from './HomeContentView';
import LeftColumnView from './left_column/LeftColumnView';
import LoadingResultsView from './LoadingResultsView';
import NoResultsView from './NoResultsView';
import RightColumnView from './right_column/RightColumnView';
import SearchErrorView from './SearchErrorView';
import viewTemplate from '../templates/main_view.html';
import messageTemplate from '../templates/content_explanation_message.html';

class BaseView extends Backbone.View {
    get mainLayout() {
        return _.template(viewTemplate);
    }

    get message() {
        return _.template(messageTemplate);
    }

    initialize(options) {
        this.options = options;
        this.mediator = options.mediator;
        this.bindEvents(this.mediator);
    }

    addEnvironmentToTitle() {
        const url = document.URL;
        const envStart = url.indexOf('//') + 2;
        const envEnd = url.indexOf('.', envStart);
        const env = url.substring(envStart, envEnd);

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
        this.$el.html(this.mainLayout());

        this.headerView = new HeaderView({
            //     searchParamsModel: this.options.searchParamsModel,
            //     searchResultsCollection: this.options.searchResultsCollection,
            //     facetsCollection: this.options.facetsCollection
            el: this.$el.find('.search-header'),
            config: this.options.config,
            mediator: this.mediator
        }).render();

        this.homePageView = new HomeContentView({
            //     facetsCollection: this.options.facetsCollection,
            //     model: this.options.searchParamsModel
            el : this.$el.find('#home-page'),
            config: this.options.config,
            mediator: this.mediator
        }).render();

        this.loadingResultsView = new LoadingResultsView({
            //     resultsCollection: this.options.searchResultsCollection,
            //     searchParamsModel: this.options.searchParamsModel
            el : this.$el.find('#loading-results'),
            mediator: this.mediator
        }).render();

        this.alertMessageView = new AlertMessageView({
            el: this.$el.find('#alert-placeholder'),
            mediator: this.mediator
        }).render();

        this.noResultsView = new NoResultsView({
            el: this.$el.find('#no-results'),
            mediator: this.mediator
        }).render();

        this.searchErrorView = new SearchErrorView({
            el: this.$el.find('#search-error'),
            mediator: this.mediator
        }).render();

        this.attributionView = new AttributionView({
            el: this.$el.find('#attribution'),
        }).render();

        this.leftColumnView = new LeftColumnView({
            //     searchParamsModel: this.options.searchParamsModel,
            //     resultsCollection: this.options.searchResultsCollection,
            //     facetsCollection: this.options.facetsCollection
            el: this.$el.find('#left-column'),
            mediator: this.mediator
        }).render();

        this.rightColumnView = new RightColumnView({
            //     collection : this.collection,
            //     searchParamsModel: this.options.searchParamsModel,
            //     searchResultsCollection: this.options.searchResultsCollection
            el: this.$el.find('#right-column'),
            mediator: this.mediator
        }).render();

        return this;
    }
}

export default BaseView;
