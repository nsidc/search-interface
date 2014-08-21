define(['vendor/requirejs/text!templates/acadis_main_view.html',
        'vendor/requirejs/text!templates/content_explanation_message.html',
        'views/AlertMessageView',
        'views/NoResultsView',
        'views/right_column/RightColumnView',
        'views/SearchErrorView',
        'lib/objectFactory',
        'lib/mediator_mixin'],
      function (mainViewTemplate,
                explanationMessage,
                AlertMessageView,
                NoResultsView,
                RightColumnView,
                SearchErrorView,
                objectFactory,
                mediatorMixin) {

  var AcadisMainView, templates, addEnvironmentToTitle;

  templates = {
    mainLayout : _.template(mainViewTemplate),
    message: _.template(explanationMessage)
  };

  addEnvironmentToTitle = function () {
    var url, envStart, envEnd, env;

    url = document.URL;

    envStart = url.indexOf('//') + 2;
    envEnd = url.indexOf('.', envStart);

    env = url.substring(envStart, envEnd);

    if (env !== 'nsidc') {
      document.title = document.title + ' - ' + env;
    }
  };

  AcadisMainView = Backbone.View.extend({

    initialize : function (options) {
      this.options = options;
      this.bindEvents();
    },

    bindEvents: function () {
      this.mediatorBind('search:initiated', this.onNewSearchInitiated, this);
      this.mediatorBind('search:resetClear', this.onClearSearch, this);
    },

    onNewSearchInitiated : function () {
      window.scrollTo(0, 0);
      this.removeContentExplanationMessage();
    },

    onClearSearch : function () {
      this.removeContentExplanationMessage();
      this.$el.find('#content').append(templates.message({text: 'Your search has been reset.  Please perform a new search.'}));
    },

    removeContentExplanationMessage: function () {
      var message = this.$el.find('#content-explanation-message');
      if (typeof message !== 'undefined') {
        message.remove();
      }
    },

    render : function () {
      addEnvironmentToTitle();

      this.$el.html(templates.mainLayout());

      objectFactory.createInstance('MainHeaderView', {
        el : this.$el.find('.search-header'),
        searchParamsModel: this.options.searchParamsModel,
        searchResultsCollection: this.options.searchResultsCollection,
        facetsCollection: this.options.facetsCollection
      }).render();

      objectFactory.createInstance('LeftColumnView', {
        el : this.$el.find('#left-column'),
        searchParamsModel: this.options.searchParamsModel,
        resultsCollection: this.options.searchResultsCollection,
        facetsCollection: this.options.facetsCollection
      }).render();

      objectFactory.createInstance('HomePageView', {
        el : this.$el.find('#home-page'),
        facetsCollection: this.options.facetsCollection,
        model: this.options.searchParamsModel
      }).render();

      objectFactory.createInstance('LoadingResultsView', {
        el : this.$el.find('#loading-results'),
        resultsCollection: this.options.searchResultsCollection,
        searchParamsModel: this.options.searchParamsModel
      }).render();

      new NoResultsView({
        el: this.$el.find('#no-results')
      }).render();

      new AlertMessageView({
        el: this.$el.find('#alert_placeholder')
      }).render();

      new RightColumnView({
        el: this.$el.find('#right-column'),
        collection : this.collection,
        searchParamsModel: this.options.searchParamsModel,
        searchResultsCollection: this.options.searchResultsCollection
      }).render();

      new SearchErrorView({
        el: this.$el.find('#search-error')[0]
      }).render();

      return this;
    }
  });

  // Mix in the mediator behaviour
  _.extend(AcadisMainView.prototype, mediatorMixin);

  return AcadisMainView;
});
