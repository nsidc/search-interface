import SpatialThumbnailView from '../../views/result_item/SpatialThumbnailView';
  
describe('Spatial Thumbnail View', function () {

    var L, view, map, boundingBoxes, get, rectangle, latLngs,
        el = document.createElement('div'),
        baseLayer = { id: 'base' },
        resultLayer = { id: 'result1' },
        resultLayer2 = { id: 'result2' },
        defaultBounds = [[45, -180], [90, 180]],
        setMapPixelSize = 160;

    map = {
        fitBounds: sinon.stub(),
        _onResize: sinon.stub()
    };

    boundingBoxes = [{
        north: 87,
        south: 83,
        east: -45,
        west: -47
    }, {
        north: 78,
        south: 75,
        east: 175,
        west: 170
    }];

    latLngs = [[
        [83, -47],
        [87, -45]
    ], [
        [75, 170],
        [78, 175]
    ]];

    beforeEach(function () {

        rectangle = sinon.stub();
        rectangle.withArgs(latLngs[0]).returns(resultLayer);
        rectangle.withArgs(latLngs[1]).returns(resultLayer2);

        window.L = {
            Browser: {},
            imageOverlay: sinon.stub().returns(baseLayer),
            rectangle: rectangle,
            map: sinon.stub().returns(map),
            CRS: {EPSG3857: 'test3857', EPSG4326: 'test4326'},
            extend: sinon.stub()
        };
        L = window.L;

        get = sinon.stub().withArgs('boundingBoxes').returns(boundingBoxes);

        view = new SpatialThumbnailView({
            el: el,
            model: {
                get: get
            },
            thumbnailBounds: defaultBounds,
            mapProjection: '3857',
            mapPixelSize: setMapPixelSize
        });

    });

    afterEach(function () {
        map.fitBounds.reset();
        map._onResize.reset();
        rectangle.reset();

        L.map.reset();

        get.reset();
    });

    describe('rendering with normal bounding boxes', function () {

        beforeEach(function () {
            view.render();
        });

        it('creates a base layer with mapProjection image', function () {
            expect(L.imageOverlay).toHaveBeenCalledWith('/data/search/images/map/map-projection-3857.png');
        });

        it('creates a layer for each bounding box', function () {
            _(boundingBoxes).each(function (box) {
                var north = box.north, south = box.south, east = box.east,
                    west = box.west;
                expect(L.rectangle).toHaveBeenCalledWith([[south, west], [north, east]]);
            });
        });

        it('creates the map with the created layers', function () {
            var layers = L.map[0][1].layers;
            expect(layers).toContain(baseLayer);
            expect(layers).toContain(resultLayer);
            expect(layers).toContain(resultLayer2);
        });

        it('creates the map with disabled controls', function () {
            var options = [
                'dragging',
                'touchZoom',
                'scrollWheelZoom',
                'doubleClickZoom',
                'boxZoom',
                'keyboard',
                'attributionControl',
                'zoomControl',
                'fadeAnimation'
            ];

            _.each(options, function (option) {
                expect(L.map[0][1][option]).toBe(false);
            });
        });

        it('creates a custom CRS scaling method with zoom 0 equal to mapPixelSize', function () {
            var scale = L.extend[0][2].scale,
                fakeSelf = {options: {mapPixelSize: setMapPixelSize}};
            expect(scale.call(fakeSelf, 0)).toEqual(setMapPixelSize);
        });

        it('extends crs to use the correct CRS for the passed mapProjection', function () {
            var passedCRSValue = L.extend[0][1];
            expect(passedCRSValue).toEqual(L.CRS.EPSG3857);
        });

        it('sets the div height and width', function () {
            expect($(el).attr('style')).toContain('width: 160px; height: 160px;');
        });

        it('fits the map to the default bounds', function () {
            expect(map.fitBounds).toHaveBeenCalledWith(defaultBounds);
        });

        it('resizes the map to work around some bug causing the map to be drawn incorrectly', function () {
            expect(map._onResize).toHaveBeenCalled();
        });

    });

    describe('rendering of 4326 projection', function () {
        beforeEach(function () {
            view.options.mapProjection = '4326';
            view.render();
        });

        it('sets the div height to half of width for 4326 projection', function () {
            expect($(el).attr('style')).toContain('width: 160px; height: 80px;');
        });
    });

    describe('rendering without any bounding boxes', function () {
        beforeEach(function () {
            view.model.get.withArgs('boundingBoxes').returns(undefined);
            view.render();
        });

        it('draws no rectangle layers', function () {
            expect(L.rectangle.mock.calls.length).toBe(0);
        });
    });

    describe('rendering a bounding box that crosses the date line', function () {
        var datelineBox, north, south, east, west;

        beforeEach(function () {
            north = 88;
            south = 85;
            east = -175;
            west = 179;

            datelineBox = {
                north: north,
                south: south,
                east: east,
                west: west
            };

            view.model.get.withArgs('boundingBoxes').returns([datelineBox]);
            view.render();
        });

        it('creates two layers for a bounding box crossing the date line', function () {
            expect(L.rectangle).toHaveBeenCalledWith([[south, -180], [north, east]]);
            expect(L.rectangle).toHaveBeenCalledWith([[south, west], [north, 180]]);
        });

    });

});
