import * as Backbone from 'backbone';
import ResultItemView from '../result_item/ResultItemView';

class SearchResultsView extends Backbone.View {
    initialize(options) {
        this.config = options.config;
        this.collection = options.collection;
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
        this.collection.each(function (collectionElement) {
            var subView = new ResultItemView({
                config: this.config,
                model: collectionElement
            });
            subView.render();
            this.$el.append(subView.el);
        }, this);
    }
}

export default SearchResultsView;
