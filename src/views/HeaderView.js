import Backbone from 'backbone';
import _ from 'underscore';
import SearchCriteriaView from './search_criteria/SearchCriteriaView';
import viewTemplate from '../templates/header.html';

class HeaderView extends Backbone.View {
    get events() {
        return {
            'click #globe-logo': 'onClickLogo',
            'click #head-title': 'onClickLogo'
        };
    }

    initialize(options) {
        this.options = options;
        this.mediator = options.mediator;
    }

    render() {
        this.$el.html(_.template(viewTemplate));
        this.searchCriteriaView = new SearchCriteriaView({
            el: this.$el.find('#search-criteria'),
            config: this.options.config,
            mediator: this.mediator,
            model: this.options.searchParamsModel,
            collection: this.options.searchResultsCollection,
            osProvider: this.options.osProvider,
        });
        this.searchCriteriaView.render();
        return this;
    }

    onClickLogo() {
      this.mediator.trigger('app:home');
    }

}

export default HeaderView;
