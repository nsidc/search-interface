define(
    [
      'text!templates/no_results.html',
      'lib/mediator_mixin'
    ],
    function (noResultsTemplate, mediatorMixin) {

      var NoResultsView;

      NoResultsView = Backbone.View.extend({

        className: 'no-results hidden',

        initialize: function () {
          this.mediatorBind('search:noResults', this.onNoResultsReturned, this);
          this.mediatorBind('search:initiated', this.onSearchInitiated, this);
          this.mediatorBind('search:refinedSearch', this.onSearchInitiated, this);
          this.mediatorBind('search:displayPreviousResults', this.onDisplayPreviousResults, this);
          this.mediatorBind('app:home', this.onAppHome, this);
        },

        render: function () {
          this.$el.append(_.template(noResultsTemplate));
          return this;
        },

        onNoResultsReturned: function () {
          this.showNoResultsMessage();
        },

        onSearchInitiated: function () {
          this.hideNoResultsMessage();
        },

        onDisplayPreviousResults: function () {
          this.hideNoResultsMessage();
        },

        onAppHome: function () {
          this.hideNoResultsMessage();
        },

        showNoResultsMessage: function () {
          this.$el.removeClass('hidden');
        },

        hideNoResultsMessage: function () {
          this.$el.addClass('hidden');
        }
      });

      _.extend(NoResultsView.prototype, mediatorMixin);

      return NoResultsView;
    });
