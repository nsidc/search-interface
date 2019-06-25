define(['text!templates/search_error_view.html',
  'lib/mediator_mixin'],
  function (searchErrorTemplate, mediatorMixin) {

  var SearchErrorView, templates;
  templates = {
    searchError : _.template(searchErrorTemplate)
  };

  SearchErrorView = Backbone.View.extend({
    initialize : function () {
      this.bindEvents();
    },

    render : function () {
      this.$el.append(templates.searchError());
      return this;
    },

    bindEvents: function () {
      this.mediatorBind('search:initiated', this.onSearchInitiated, this);
      this.mediatorBind('search:error', this.onSearchError, this);
    },

    show: function () {
      this.$el.removeClass('hidden');
    },

    hide : function () {
      this.$el.addClass('hidden');
    },

    onSearchInitiated: function () {
      this.hide();
    },

    onSearchError: function () {
      this.show();
    }
  });

  // Mix in the mediator behaviour
  _.extend(SearchErrorView.prototype, mediatorMixin);

  return SearchErrorView;
});
