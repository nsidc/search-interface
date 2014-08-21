define(['lib/objectFactory', 'lib/mediator_mixin'],
       function (objectFactory, mediatorMixin) {

  var SearchResultsView;

  SearchResultsView = Backbone.View.extend({
    initialize : function () {

      this.renderItems();
      this.bindEvents();
    },

    bindEvents: function () {
      this.mediatorBind('search:complete', this.render, this);
    },

    render: function () {
      this.$el.empty();
      this.renderItems();
      return this;
    },

    renderItems: function () {
      this.collection.each(function (collectionElement) {
        var subView = objectFactory.createInstance('ResultItemView', {
          model: collectionElement
        });
        subView.render();
        this.$el.append(subView.el);
      }, this);
    }
  });

  // Mix in the mediator behaviour
  _.extend(SearchResultsView.prototype, mediatorMixin);

  return SearchResultsView;
});
