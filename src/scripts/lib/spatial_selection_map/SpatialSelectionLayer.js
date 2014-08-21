define(['lib/mediator_mixin'], function (mediatorMixin) {

  var SpatialSelectionLayer = OpenLayers.Class(OpenLayers.Layer.Vector, {
    defaultOptions : {
      displayInLayerSwitcher: false
    },

    initialize : function (name, options) {
      this.name = name;
      this.options = OpenLayers.Util.extend(options, this.defaultOptions);
      OpenLayers.Layer.Vector.prototype.initialize.apply(
        this, arguments
      );

      this.bindEvents();
    },

    bindEvents : function () {
      this.events.register('sketchstarted', this, this.onClearSelection);

      this.events.register('sketchmodified', this, this.onSelectionDone);

      this.events.register('sketchcomplete', this, this.onSelectionDone);
    },

    onClearSelection : function () {
      this.mediatorTrigger('map:clearSelection');
    },

    onSelectionDone : function (evt) {
      if (this.name !== 'Layer for Bboxes Crossing the Date Line') {
        this.mediatorTrigger('map:selectionDone', evt.feature.geometry);
      }
    }
  });

  _.extend(SpatialSelectionLayer.prototype, mediatorMixin);

  return SpatialSelectionLayer;
});
