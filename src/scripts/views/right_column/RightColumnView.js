define(
  ['views/right_column/SearchResultsView',
   'views/right_column/results_footer/ResultsFooterView',
   'lib/mediator_mixin',
   'lib/objectFactory',
   'text!templates/right_column/right_column.html'],
  function (SearchResultsView,
            ResultsFooterView,
            mediatorMixin,
            objectFactory,
            rightColumnTemplate) {
    var RightColumnView,
        template = _.template(rightColumnTemplate);

    RightColumnView = Backbone.View.extend({
      initialize: function (options) {
        this.options = options;
        this.bindEvents();
      },

      bindEvents: function () {
        // Render both when the new search is submitted (to show the user what
        // they searched for is being worked on) and when the results are
        // returned (params may have been corrected or normalized)
        this.mediatorBind('search:initiated', this.hideView, this);
        this.mediatorBind('search:complete', this.onSearchComplete, this);
        this.mediatorBind('search:displayPreviousResults', this.onDisplayPreviousResults, this);
        this.mediatorBind('search:refinedSearch', this.onSearchRefined, this);
        this.mediatorBind('search:noResults', this.hideView, this);
        this.mediatorBind('search:resetClear', this.hideView, this);
        this.mediatorBind('app:home', this.onAppHome, this);
      },

      render: function () {
        this.$el.html(template());

        objectFactory.createInstance('ResultsHeaderView', {
          el: this.$el.find('.results-header'),
          searchParamsModel: this.options.searchParamsModel,
          searchResultsCollection: this.options.searchResultsCollection
        }).render();

        objectFactory.createInstance('SearchResultsView',{
          el : this.$el.find('#results')[0],
          collection : this.options.searchResultsCollection
        });

        objectFactory.createInstance('ResultsFooterView',{
          el: this.$el.find('.results-footer'),
          searchParamsModel: this.options.searchParamsModel,
          searchResultsCollection: this.options.searchResultsCollection
        }).render();
      },

      hide: function (id) {
        this.$el.find(id).addClass('hidden');
      },

      show: function (id) {
        this.$el.find(id).removeClass('hidden');
      },

      onDisplayPreviousResults: function () {
        this.show('#current-results');
      },

      hideView: function () {
        this.hide('#current-results');
      },

      onSearchComplete: function () {
        this.show('#current-results');
        this.hide('#filtering-results');
      },

      onSearchRefined: function () {
        this.hide('#current-results');
        this.show('#filtering-results');
      },

      onAppHome: function () {
        this.hide('#current-results');
        this.hide('#filtering-results');
      }
    });

    // Mix in the mediator behaviour
    _.extend(RightColumnView.prototype, mediatorMixin);

    return RightColumnView;
  }
);
