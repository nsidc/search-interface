define(['lib/mediator_mixin'], function (mediatorMixin) {

  /*
  * Click control to capture clicks on the map. If the transform control is active
  * then a click will deactivate the transform control and activate the selection
  * control.
  */
  var ClickControl = OpenLayers.Class(OpenLayers.Control, {
    defaultHandlerOptions: {
      'single': true,
      'double': false,
      'pixelTolerance': 0,
      'stopSingle': false,
      'stopDouble': false
    },

    initialize: function () {
      this.handlerOptions = OpenLayers.Util.extend(
        {}, this.defaultHandlerOptions
      );
      OpenLayers.Control.prototype.initialize.apply(
        this, arguments
      );
      this.handler = new OpenLayers.Handler.Click(
        this,
        {
          'click': function (e) {
            this.mediatorTrigger('map:click', e);
          }
        },
        this.handlerOptions
      );
    }
  });

  _.extend(ClickControl.prototype, mediatorMixin);

  return ClickControl;

});
