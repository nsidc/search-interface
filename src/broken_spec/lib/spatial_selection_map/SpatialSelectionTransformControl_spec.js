// import SpatialSelectionTransformControl from '../../../lib/spatial_selection_map/SpatialSelectionTransformControl';
import Mediator from '../../../lib/Mediator.js';

describe.skip('SpatialSelectionTransformControl', function () {
    describe('Uses the OpenLayers.Control.TransformFeature to manipulate a bounding box', function () {
        var control, selectionLayer;

        beforeEach(function () {
            selectionLayer = {id: 'TestLayer'};
            control = new SpatialSelectionTransformControl(selectionLayer);
        });

        it('should extend the TranformFeature control', function () {
            expect(control.selectionLayer.id).toBe('TestLayer');
        });

        it('should set the rotate property to false', function () {
            expect(control.rotate).toBe(false);
        });

        it('should initialize with the default renderIntent option', function () {
            expect(control.options.renderIntent).toBe('transform');
        });

        it('listens for the transformcomplete event', function () {
            expect(control.events.listeners.transformcomplete).not.toBe(null);
        });

        it('triggers map:selectionDone when the manipulation is complete', function () {
            var geom, mediatorStub = sinon.stub(new Mediator());
            control.setMediator(mediatorStub);
            geom = {feature: {geometry: {}}};

            control.onSelectionDone(geom);

            expect(mediatorStub.trigger).toHaveBeenCalledWith('map:selectionDone');
        });
    });
});
