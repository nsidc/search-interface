define(
  [
    'text!templates/loading_results_view_overlay.html',
    'lib/mediator_mixin'
  ],
  function (loadingOverlayTemplate, mediatorMixin) {

    var LoadingResultsView, templates, datasetsReturned, facetsReturned;

    templates = {
      heading: _.template(loadingOverlayTemplate)
    };

    LoadingResultsView = Backbone.View.extend({

      className: 'loading-results-ajax hidden',

      initialize: function (options) {
        if (options !== undefined) {
          this.facetsEnabled = options.facetsEnabled;
        }

        this.bindEvents();

        datasetsReturned = true;
        facetsReturned = true;
      },

      bindEvents: function () {
        this.mediatorBind('search:initiated', this.onSearchInitiated, this);
        this.mediatorBind('search:urlParams', this.onSearchInitiated, this);
        this.mediatorBind('search:fullSearchComplete', this.onSearchDatasetsReturned, this);
        this.mediatorBind('search:facetsReturned', this.onSearchFacetsReturned, this);
        this.mediatorBind('search:refinedSearchComplete', this.onSearchDatasetsReturned, this);
        this.mediatorBind('search:noResults', this.hideLoadingResultsOverlay, this);
        this.mediatorBind('search:error', this.hideLoadingResultsOverlay, this);
        this.mediatorBind('app:home', this.onAppHome, this);
        this.mediatorBind('search:success', this.onSearchSuccess, this);
      },

      render: function () {
        this.$el.append(templates.heading());
        return this;
      },

      onSearchInitiated: function () {
        datasetsReturned = false;
        facetsReturned = false;
        this.showLoadingResultsOverlay();
      },

      onSearchDatasetsReturned: function () {
        datasetsReturned = true;
        this.checkSearchComplete();
      },

      onSearchFacetsReturned: function () {
        facetsReturned = true;
        this.checkSearchComplete();
      },

      checkSearchComplete: function () {
        if (datasetsReturned && facetsReturned) {
          this.hideLoadingResultsOverlay();
        }
      },

      showLoadingResultsOverlay: function () {
        this.$el.removeClass('hidden');
        this.$('#loading-results-text').text('Performing Search...');
      },

      hideLoadingResultsOverlay: function () {
        this.$el.addClass('hidden');
      },

      onAppHome: function () {
        this.hideLoadingResultsOverlay();
      },

      onSearchSuccess: function () {
        this.$('#loading-results-text').text('Loading Results...');
      }
    });

    // Mix in the mediator behaviour
    _.extend(LoadingResultsView.prototype, mediatorMixin);

    return LoadingResultsView;
  });
