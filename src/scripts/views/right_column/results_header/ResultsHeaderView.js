define(
  [
    'lib/mediator_mixin',
    'lib/objectFactory',
    'views/right_column/results_header/ResultsCountView',
    'views/right_column/results_header/SortResultsView',
    'vendor/requirejs/text!templates/right_column/results_header/results_header.html'
  ], function (
    mediatorMixin,
    objectFactory,
    ResultsCountView,
    SortResultsView,
    resultsHeaderTemplate
  ) {
    var ResultsHeaderView;

    ResultsHeaderView = Backbone.View.extend({
      template: _.template(resultsHeaderTemplate),

      initialize: function (options) {
        this.options = options;
        this.bindEvents();
      },

      bindEvents: function () {
        this.mediatorBind('search:complete', this.render, this);
        this.mediatorBind('search:complete', this.showControls, this);
        this.mediatorBind('search:initiated', this.hideControls, this);
        this.mediatorBind('search:displayPreviousResults', this.showControls, this);
        this.mediatorBind('app:home', this.hideControls, this);
      },

      render: function () {

        this.$el.html(this.template());

        new ResultsCountView({
          el: this.$el.find('.results-count'),
          collection: this.options.searchResultsCollection
        }).render();

        // do not render the results-per-page and sort-by dropdowns when there
        // are 0 results
        if (this.options.searchResultsCollection.getTotalResultsCount() !== 0) {

          objectFactory.createInstance('SortResultsView', {
            el: this.$el.find('.sort-results'),
            collection: this.options.searchResultsCollection,
            model: this.options.searchParamsModel
          }).render();

          objectFactory.createInstance('ResultsPerPageView', {
            el: this.$el.find('.results-per-page'),
            collection: this.options.searchResultsCollection,
            model: this.options.searchParamsModel
          }).render();

        }

        return this;
      },

      hideControls: function () {
        this.$el.addClass('hidden');
      },

      showControls: function () {
        this.$el.removeClass('hidden');
      }

    });

    // Mix in the mediator behaviour
    _.extend(ResultsHeaderView.prototype, mediatorMixin);

    return ResultsHeaderView;
  }
);
