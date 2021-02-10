/* jshint esversion: 6 */

import Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../templates/loading_results_view_overlay.html';

class LoadingResultsView extends Backbone.View {

      initialize(options) {
        if (options !== undefined) {
          this.facetsEnabled = options.facetsEnabled;
        }
        this.mediator = options.mediator;
        this.bindEvents(this.mediator);
        this.datasetsReturned = true;
        this.facetsReturned = true;
      }

      bindEvents(mediator) {
        mediator.on('search:initiated', this.onSearchInitiated, this);
        mediator.on('search:urlParams', this.onSearchInitiated, this);
        mediator.on('search:fullSearchComplete', this.onSearchDatasetsReturned, this);
        mediator.on('search:facetsReturned', this.onSearchFacetsReturned, this);
        mediator.on('search:refinedSearchComplete', this.onSearchDatasetsReturned, this);
        mediator.on('search:noResults', this.hideLoadingResultsOverlay, this);
        mediator.on('search:error', this.hideLoadingResultsOverlay, this);
        mediator.on('app:home', this.onAppHome, this);
        mediator.on('search:success', this.onSearchSuccess, this);
      }

      render() {
        this.$el.html(_.template(viewTemplate)());
        return this;
      }

      onSearchInitiated() {
        this.datasetsReturned = false;
        this.facetsReturned = false;
        this.showLoadingResultsOverlay();
      }

      onSearchDatasetsReturned() {
        this.datasetsReturned = true;
        this.checkSearchComplete();
      }

      onSearchFacetsReturned() {
        this.facetsReturned = true;
        this.checkSearchComplete();
      }

      checkSearchComplete() {
        if (this.datasetsReturned && this.facetsReturned) {
          this.hideLoadingResultsOverlay();
        }
      }

      showLoadingResultsOverlay() {
        this.$el.removeClass('hidden');
        this.$('#loading-results-text').text('Performing Search...');
      }

      hideLoadingResultsOverlay() {
        this.$el.addClass('hidden');
      }

      onAppHome() {
        this.hideLoadingResultsOverlay();
      }

      onSearchSuccess() {
        this.$('#loading-results-text').text('Loading Results...');
      }
    }

export default LoadingResultsView;
