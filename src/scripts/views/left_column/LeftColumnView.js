define(['lib/mediator_mixin',
        'lib/objectFactory',
        'vendor/requirejs/text!templates/left_column/left_column.html'],
       function (mediatorMixin,
                 objectFactory,
                 leftColumnTemplate) {

  var LeftColumnView, templates;

  templates = {
    leftColumn : _.template(leftColumnTemplate)
  };

  LeftColumnView = Backbone.View.extend({

    initialize: function (options) {
      this.options = options;
      this.bindEvents();
    },

    bindEvents: function () {
      // Render both when the new search is submitted (to show the user what
      // they searched for is being worked on) and when the results are
      // returned (params may have been corrected or normalized)
      this.mediatorBind('search:initiated', this.hideView, this);
      this.mediatorBind('search:facetsReturned', this.onSearchComplete, this);
      this.mediatorBind('search:displayPreviousResults', this.onDisplayPreviousResults, this);
      this.mediatorBind('search:noResults', this.hideView, this);
      this.mediatorBind('search:resetClear', this.hideView, this);
      this.mediatorBind('app:home', this.hideView, this);
    },

    render: function () {

      this.$el.html(templates.leftColumn());

      if (this.options.facets) {
        objectFactory.createInstance('FacetsView', {
          el: this.$el.find('#facets'),
          facetsCollection: this.options.facetsCollection,
          searchParamsModel: this.options.searchParamsModel
        }).render();
      }

      objectFactory.createInstance('LogoView', {el : this.$el.find('.project-logo') }).render();

      return this;
    },

    hide: function () {
      this.$el.addClass('hidden');
    },

    show: function () {
      this.$el.removeClass('hidden');
    },

    onSearchComplete: function () {
      this.render();
      this.show();
    },

    onDisplayPreviousResults: function () {
      this.show();
    },

    hideView: function () {
      this.hide();
    }
  });

  // Mix in the mediator behaviour
  _.extend(LeftColumnView.prototype, mediatorMixin);

  return LeftColumnView;
});
