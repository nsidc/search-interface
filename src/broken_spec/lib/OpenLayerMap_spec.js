// import OpenLayerMap from '../../lib/OpenLayerMap';

describe.skip('map', function () {
    var map, options, mapId = 'test_map';

    beforeEach(function () {
        var mapContainerEl;

        // create an element for the map
        $('body').append($('<div id=\'' + mapId + '\'>'));
        mapContainerEl = $('#' + mapId);

        options = {
            mapContainerId: mapId
        };

        map = new OpenLayerMap(options, '4326');
    });

    afterEach(function () {
        $('#' + mapId).remove();
    });

    describe('Using OpenLayers to build a map', function () {
        it('should initialize with a hash of options specifying the mapContainerId', function () {
            expect(map.options.mapContainerId).toBe(mapId);
        });
    });

});
