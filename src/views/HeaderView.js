/* jshint esversion: 6 */

import Backbone from 'backbone';
import _ from 'underscore';
import SearchCriteriaView from './search_criteria/SearchCriteriaView';
import viewTemplate from '../templates/header.html';
import SearchParamsModel from '../models/SearchParamsModel';

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
        let model = new SearchParamsModel({
            mediator: this.mediator
        });
        this.$el.html(_.template(viewTemplate));
        this.searchCriteriaView = new SearchCriteriaView({
            el: this.$el.find('#search-criteria'),
            config: this.options.config,
            mediator: this.mediator,
            model: model
        });
        this.searchCriteriaView.render();
        return this;
    }

    onClickLogo() {
      this.mediatorTrigger('app:home');
    }

}

export default HeaderView;
