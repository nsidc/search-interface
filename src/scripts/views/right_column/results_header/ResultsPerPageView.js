define(
  [
    'views/right_column/results_header/DropdownView',
    'text!templates/right_column/results_header/results_per_page_label.html',
  ], function (
    DropdownView,
    label
  ) {

    var ResultsPerPageView;

    ResultsPerPageView = DropdownView.extend({

      template: _.template(label),

      initialize : function (options) {
        var resultsPerPage = options.features.resultsPerPage;

        this.updateParamsModel = this.model.setItemsPerPage;
        this.dropdownOptions = _.object(resultsPerPage, resultsPerPage);
      },

      render: function () {
        DropdownView.prototype.render.call(this);
        this.$el.prepend(this.template());

        return this;
      },

      getButtonId: function () {
        return 'results-per-page';
      },

      getSelectedOption: function () {
        return this.collection.getItemsPerPage();
      }

    });

    return ResultsPerPageView;
  });
