define(
  [
    'lib/mediator_mixin',
    'text!templates/right_column/results_header/total_results_count.html'
  ],
  function (
    mediatorMixin,
    resultsCountTemplate
  ) {

    var ResultsCountView;

    ResultsCountView = Backbone.View.extend({

      template: _.template(resultsCountTemplate),

      initialize : function () {
        this.mediatorBind('search:complete', this.render, this);
      },

      render: function () {
        var first,
            last,
            pageNumber,
            perPage,
            totalResults;

        pageNumber = this.collection.getPageNumber();
        perPage = this.collection.getItemsPerPage();
        totalResults = this.collection.getTotalResultsCount();

        first = 1 + perPage * (pageNumber - 1);
        last = Math.min(first - 1 + perPage, totalResults);

        this.$el.html(this.template({
          first: first,
          last: last,
          totalResults: totalResults
        }));

        return this;
      }

    });

    // Mix in the mediator behaviour
    _.extend(ResultsCountView.prototype, mediatorMixin);

    return ResultsCountView;
  });
