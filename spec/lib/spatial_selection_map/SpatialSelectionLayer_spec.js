define(['lib/spatial_selection_map/SpatialSelectionLayer', 'lib/Mediator'], function (SpatialSelectionLayer, Mediator) {

  describe('SpatialSelectionLayer', function () {
    describe('Uses the OpenLayers.Layer.Vector to draw a bounding box', function () {
      var layer, mediatorStub;

      beforeEach(function () {
        layer = new SpatialSelectionLayer('TestName', {});
      });

      it('should extend the Vector layer with the same name', function () {
        expect(layer.name).toBe('TestName');
      });

      it('should initialize with the default displayInLayerSwitcher option', function () {
        expect(layer.options.displayInLayerSwitcher).toBe(false);
      });

      it('listens for the sketchstarted event', function () {
        expect(layer.events.listeners.sketchstarted).not.toBe(null);
      });

      it('listens for the sketchmodified event', function () {
        expect(layer.events.listeners.sketchmodified).not.toBe(null);
      });

      it('listens for the sketchcomplete event', function () {
        expect(layer.events.listeners.sketchcomplete).not.toBe(null);
      });

      it('triggers map:clearSelection when the selection is started', function () {
        mediatorStub = sinon.stub(new Mediator());
        layer.setMediator(mediatorStub);

        layer.onClearSelection();

        expect(mediatorStub.trigger).toHaveBeenCalledWith('map:clearSelection');
      });

      it('triggers map:selectionDone when the selection is modified', function () {
        mediatorStub = sinon.stub(new Mediator());
        layer.setMediator(mediatorStub);
        var geomStub = {feature: {geometry: {}}};

        layer.onSelectionDone(geomStub);

        expect(mediatorStub.trigger).toHaveBeenCalledWith('map:selectionDone');
      });
    });

  });
});
