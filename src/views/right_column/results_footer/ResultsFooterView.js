define(['text!templates/right_column/results_footer_view.html',
       'lib/objectFactory'],
       function (footerTemplate,
                 objectFactory) {

  var ResultsFooterView, templates;

  templates = {
    footer : _.template(footerTemplate)
  };

  ResultsFooterView = Backbone.View.extend({

    tagName: 'div',
    className: 'results-footer',

    initialize: function (options) {
      this.options = options;
    },

    render: function () {

      this.$el.html(templates.footer());

      objectFactory.createInstance('PaginationControlsView', {
        el: this.$el.find('.pagination'),
        model: this.options.searchParamsModel,
        collection: this.options.searchResultsCollection
      }).render();

      return this;
    }
  });

  return ResultsFooterView;
});
