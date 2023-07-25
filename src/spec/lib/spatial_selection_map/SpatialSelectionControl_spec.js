import SpatialSelectionControl from '../../../lib/spatial_selection_map/SpatialSelectionControl';

describe('SpatialSelectionControl', function () {
    describe('Uses the OpenLayers.Control.DrawFeature to create a bounding box', function () {
        var control;

        beforeEach(function () {
            var selectionLayer = { name: 'test_layer' },
                handler = OpenLayers.Handler.RegularPolygon;

            control = new SpatialSelectionControl(selectionLayer, handler);
        });

        it('should extend the DrawFeature control', function () {
            expect(control.layer.name).toBe('test_layer');
        });

        it('should set the handler \'irregular\' property to true', function () {
            expect(control.handler.irregular).toBeTruthy();
        });

        it('listens for the featureadded event that triggers the \'map:selectionMade\' event', function () {
            control.bindEvents();

            expect(control.events.listeners.featureadded).not.toBe(null);
        });
    });
});
