define(['lib/objectFactory',
        'text!templates/search_criteria/spatial_search.html'],
  function (objectFactory,
            spatialTemplate) {
    var template, SpatialCoverageView;

    template = _.template(spatialTemplate);

    SpatialCoverageView = Backbone.View.extend({

      events: {
        'click #spatial-search-box' : 'toggleCompassView'
      },

      initialize: function (options) {
        this.options = options;
      },

      render: function (text) {

        if (this.spatialCoverageView === undefined || this.spatialCoverageView === undefined) {
          this.$el.html(template());

          this.spatialCoverageView = objectFactory.createInstance('SpatialCoverageTextView', {
            el: this.$el.find('#spatial-search-box'),
            model: this.model
          });

          this.compassView = objectFactory.createInstance('SpatialCoverageCompassView', {
            el: this.$el.find('#compass-container'),
            model: this.model,
            map: this.options.map,
            features: this.options.features
          }).render();
        }

        this.spatialCoverageView.render(text);

        return this;
      },

      toggleCompassView: function () {
        this.compassView.toggleVisibility();
        var compassInput = document.getElementById('spatial-options');
        if (compassInput) {
          compassInput.focus();
        }
      }
    });

    return SpatialCoverageView;
  });
