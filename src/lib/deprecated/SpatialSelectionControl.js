import OpenLayers from 'ol';

import mediatorMixin from '../mediator_mixin';

var SpatialSelectionControl = OpenLayers.Class(OpenLayers.Control.DrawFeature, {
  defaultHandlerOptions : {
    irregular: true
  },

  initialize : function (selectionLayer, handler) {
    this.selectionLayer = selectionLayer;
    this.handler = handler;

    this.handlerOptions = OpenLayers.Util.extend(
      {}, this.defaultHandlerOptions
    );
    OpenLayers.Control.DrawFeature.prototype.initialize.apply(
      this, arguments
    );

    this.bindEvents();
  },

  bindEvents : function () {
    this.events.register('featureadded', this, function () {
      this.mediatorTrigger('map:selectionMade');
    });
  }
});

_.extend(SpatialSelectionControl.prototype, mediatorMixin);

export default SpatialSelectionControl;
