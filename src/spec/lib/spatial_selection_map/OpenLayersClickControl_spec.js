import OpenLayersClickControl from '../../../lib/spatial_selection_map/OpenLayersClickControl';

describe('ClickControl', function () {
    describe('Uses the OpenLayers.Control to capture clicks within the map', function () {
        var mapObject, clickControl;

        beforeEach(function () {
            mapObject = {id: 'foo'};
            clickControl = new OpenLayersClickControl({mapObject: mapObject});
        });

        it('should extend the Control class and set the mapObject', function () {
            expect(clickControl.mapObject.id).toBe('foo');
        });

        it('initializes an OpenLayers.Handler.Click object', function () {
            expect(clickControl.handler instanceof OpenLayers.Handler.Click).toBeTruthy();
        });

        it('sets default options for the handler', function () {
            expect(clickControl.handler.single).toBe(true);
            expect(clickControl.handler.double).toBe(false);
            expect(clickControl.handler.pixelTolerance).toBe(0);
            expect(clickControl.handler.stopSingle).toBe(false);
            expect(clickControl.handler.stopDouble).toBe(false);
        });
    });
});
