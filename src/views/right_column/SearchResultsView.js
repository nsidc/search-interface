/* jshint esversion: 6 */

import * as Backbone from 'backbone';
import ResultItemView from '../result_item/ResultItemView';

class SearchResultsView extends Backbone.View {
    initialize(options) {
        this.mediator = options.mediator;
        this.bindEvents(this.mediator);
    }

    bindEvents(mediator) {
        mediator.on('search:complete', this.render, this);
    }

    render() {
        this.$el.empty();
        this.renderItems();
        return this;
    }

    renderItems() {
        new ResultItemView();
        // this.collection.each(function (collectionElement) {
        //   var subView = objectFactory.createInstance('ResultItemView', {
        //     model: collectionElement
        //   });
        //   subView.render();
        //   this.$el.append(subView.el);
        // }, this);
    }
}

export default SearchResultsView;
