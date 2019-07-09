define(['text!templates/home_page_nsidc.html',
       'text!templates/home_page_ade.html',
       'lib/objectFactory',
       'lib/mediator_mixin'],
       function (nsidcHomeTemplate,
                 adeHomeTemplate,
                 objectFactory,
                 mediatorMixin) {
  var HomePageView;

  HomePageView = Backbone.View.extend({

    events: {
      'click .example-terms li': 'onClickExampleTerm',
      'click img#search-now': 'onStartSearchingClicked'
    },

    initialize: function (options) {
      this.options = options;
      this.bindEvents();
    },

    bindEvents: function () {
      this.mediatorBind('app:home', this.onAppHome, this);
      this.mediatorBind('search:initiated', this.onSearchInitiated, this);
      this.mediatorBind('search:urlParams', this.onSearchInitiated, this);
      this.mediatorBind('search:facetsOnly', this.onSearchInitiated, this);
    },

    render: function () {
      var currentTemplate;

      if (this.options.templateId === 'NSIDC') {
        currentTemplate = nsidcHomeTemplate;
      } else if (this.options.templateId === 'ADE') {
        currentTemplate = adeHomeTemplate;
      } else {
        throw new Error('Invalid template ID');
      }

      this.$el.html(_.template(currentTemplate));

      if (this.options.homePageDataCenters) {
        objectFactory.createInstance('LiveDataCentersView', {
          model: this.model,
          el: document.getElementsByClassName('live-data-centers')[0]
        }).render();
      }

      return this;
    },

    onAppHome: function () {
      this.show();
    },

    onSearchInitiated: function () {
      this.hide();
    },

    onStartSearchingClicked: function () {
      this.mediatorTrigger('search:initiated', this.model);
    },

    onClickExampleTerm: function (event) {
      this.mediatorTrigger('search:example', event.target.text);
    },

    show: function () {
      this.$el.removeClass('hidden');
    },

    hide: function () {
      this.$el.addClass('hidden');
    }


  });

  _.extend(HomePageView.prototype, mediatorMixin);

  return HomePageView;
});
