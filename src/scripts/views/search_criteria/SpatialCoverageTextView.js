// SpatialCoverageTextView - Backbone view to display the spatial coverage in a human readable (string) form
define(['vendor/requirejs/text!templates/search_criteria/text.html', 'lib/mediator_mixin'],
       function (textTemplate, mediatorMixin) {

  var template, SpatialCoverageTextView;

  template = _.template(textTemplate);

  // expose a constructor
  SpatialCoverageTextView = Backbone.View.extend({

    events: {
      'change #spatial-options' : 'updateModelFromInputVal'
    },

    initialize: function (options) {
      this.options = options;
      this.model.on('change', this.onModelChange, this);
      this.mediatorBind('search:resetBoundingBox', this.reset, this);
      this.mediatorBind('app:home', this.reset, this);
    },

    onModelChange: function () {
      this.render();
    },

    render: function (text) {
      // If the model is set to the defaults and we are trying to set the default identifier, override the text value.
      // Otherwise, leave the text alone.
      // TODO: Keep in sync with results collection rather than passing in text to render
      if (this.model.isSetToDefaults() && (this.model.asIdentifier() === text || text === undefined)) {
        text = '';
      }

      if (text === undefined) {
        text = this.model.asIdentifier();
      }

      this.$el.html(template({ identifierView: text, presetText: this.options.presetText }));
      return this;
    },

    updateModelFromInputVal: function () {
      var bboxIdentifier = this.$el.find('#spatial-options').val();
      this.model.setFromIdentifier(bboxIdentifier);
    },

    reset: function () {
      this.model.resetCriteria();
      this.render();
    }
  });

  _.extend(SpatialCoverageTextView.prototype, mediatorMixin);

  return SpatialCoverageTextView;

});
