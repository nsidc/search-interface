define(['lib/objectFactory',
       'vendor/requirejs/text!templates/main_header_nsidc.html',
       'vendor/requirejs/text!templates/main_header_ade.html',
       'lib/mediator_mixin'],
       function (objectFactory,
                 nsidcHeaderTemplate,
                 adeHeaderTemplate,
                 mediatorMixin) {

  var MainHeaderView = Backbone.View.extend({

    events: {
      'click #globe-logo': 'onClickLogo',
      'click #head-text': 'onClickLogo'
    },

    initialize: function (options) {
      this.options = options;
    },

    render: function () {
      var currentTemplate;
      if (this.options.templateId === 'NSIDC') {
        currentTemplate = nsidcHeaderTemplate;
      } else if (this.options.templateId === 'ADE') {
        currentTemplate = adeHeaderTemplate;
      } else {
        throw new Error('Invalid template ID');
      }

      this.$el.html(_.template(currentTemplate));

      objectFactory.createInstance('SearchCriteriaView', {
        el: this.$el.find('#search-criteria'),
        model: this.options.searchParamsModel,
        searchResultsCollection: this.options.searchResultsCollection,
        map: this.options.map,
        features: this.options.features
      }).render();

      return this;
    },

    onClickLogo: function () {
      this.mediatorTrigger('app:home');
    }

  });

  _.extend(MainHeaderView.prototype, mediatorMixin);

  return MainHeaderView;
});
