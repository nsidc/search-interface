// SpatialCoverageTextView - Backbone view to display the spatial coverage in
// four inputs that can easily be edited by the user
define(['text!templates/search_criteria/ade_text.html',
        'lib/mediator_mixin',
        'lib/utility_functions'],
       function (template, mediatorMixin, UtilityFunctions) {
  var AdeSpatialCoverageTextView = Backbone.View.extend({
    template: _.template(template),

    events: {
      'change input': 'updateModelFromInputVals',
      'click input': 'onClickInput'
    },

    initialize: function (options) {
      this.options = options;
      this.model.on('change', this.onModelChange, this);
      this.mediatorBind('app:home', this.reset, this);
      this.mediatorBind('search:resetBoundingBox', this.reset, this);
    },

    onModelChange: function () {
      this.render();
    },

    render: function (text) {
      var coords;

      // If the model is set to the defaults and we are trying to set the default identifier, override the text value.
      // Otherwise, leave the text alone.
      // TODO: Keep in sync with results collection rather than passing in text to render
      if (this.model.isSetToDefaults() && (this.model.asIdentifier() === text || text === undefined)) {
        text = '';
      }

      if (text === undefined) {
        text = this.model.asIdentifier();
      }

      if (text === '') {
        var defaults = this.model.getDefaults();
        coords = {
          north: defaults[3],
          south: defaults[1],
          east: defaults[2],
          west: defaults[0]
        };
      } else {
        coords = UtilityFunctions.nsewObjFromIdentifier(text);
      }

      this.$el.html(this.template(coords));
      return this;
    },

    onClickInput: function (event) {
      event.target.select();
    },

    reset: function () {
      this.model.resetCriteria();
      this.render();
    },

    updateModelFromInputVals: function () {
      this.model.setFromNsewObject({
        north: this.$('#spatial-options-north').val(),
        south: this.$('#spatial-options-south').val(),
        east: this.$('#spatial-options-east').val(),
        west: this.$('#spatial-options-west').val()
      });
    }
  });

  _.extend(AdeSpatialCoverageTextView.prototype, mediatorMixin);

  return AdeSpatialCoverageTextView;
});
