import * as Backbone from 'backbone';
import _ from 'underscore';
import FacetsView from './FacetsView';
import LogoView from './LogoView';
import viewTemplate from '../../templates/left_column/left_column.html';

class LeftColumnView extends Backbone.View {

    initialize(options) {
      this.options = options;
      this.mediator = options.mediator;
      this.bindEvents(this.mediator);
    }

    bindEvents(mediator) {
      // Render both when the new search is submitted (to show the user what
      // they searched for is being worked on) and when the results are
      // returned (params may have been corrected or normalized)
      mediator.on('search:initiated', this.hideView, this);
      mediator.on('search:facetsReturned', this.onSearchComplete, this);
      mediator.on('search:displayPreviousResults', this.onDisplayPreviousResults, this);
      mediator.on('search:noResults', this.hideView, this);
      mediator.on('search:resetClear', this.hideView, this);
      mediator.on('app:home', this.hideView, this);
    }

    render() {
        this.$el.html(_.template(viewTemplate)());

        if(this.options.config.facets) {
            new FacetsView({
                el: this.$el.find('#facets'),
                mediator: this.mediator,
                config: this.options.config.facets,
                facetsCollection: this.options.facetsCollection,
                searchParamsModel: this.options.searchParamsModel
            }).render();
        }

        new LogoView({
            el: this.$el.find('.project-logo')
        }).render();

        return this;
    }

    hide() {
      this.$el.addClass('hidden');
    }

    show() {
      this.$el.removeClass('hidden');
    }

    onSearchComplete() {
      this.render();
      this.show();
    }

    onDisplayPreviousResults() {
      this.show();
    }

    hideView() {
      this.hide();
    }
  }

export default LeftColumnView;
