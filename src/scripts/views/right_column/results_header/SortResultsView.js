define(
  [
    'views/right_column/results_header/DropdownView',
    'text!templates/right_column/results_header/sort_results_label.html',
  ], function (
    DropdownView,
    label
  ) {

    var SortResultsView;

    SortResultsView = DropdownView.extend({

      template: _.template(label),

      initialize : function (options) {
        this.updateParamsModel = this.model.setSortKeys;
        this.dropdownOptions = options.sortByOptions;
      },

      render: function () {
        DropdownView.prototype.render.call(this);
        this.$el.prepend(this.template());

        return this;
      },

      getButtonId: function () {
        return 'sort-results';
      },

      getSelectedOption: function () {
        var sortKeys = this.collection.getSortKeys();
        return this.dropdownOptions[sortKeys];
      }

    });

    return SortResultsView;

  });
