import SpatialMetadataView from '../../views/result_item/SpatialMetadataView';

describe('Spatial Metadata View', function () {
    var el;

    beforeEach(function () {
        el = document.createElement('div');
    });

    describe('Rendering', function () {

        it('Should format latitude and longitude properly', function () {
            // arrange
            var model, el, spatialMetadataView;
            model = new Backbone.Model({boundingBoxes: [
                {south: 1.1, north: 2.0, west: -6, east: 3.141597},
                {south: -89.1, north: 90, west: -179.5, east: 180},
                {south: -8.18, north: 80, west: -18, east: 20}
            ]});
            el = document.createElement('div');
            spatialMetadataView = new SpatialMetadataView({el: el, model: model});

            // act
            spatialMetadataView.render();

            // assert
            expect($(el).attr('data-bbox')).toBe(' North   South   East     West   \n' +
                                            '  2       1.1      3.14    -6   \n' +
                                            ' 90     -89.1    180     -179.5 \n' +
                                            ' 80      -8.18    20      -18   ');
        });

    });

    describe('Rendering with no bounding boxes', function () {

        it('should render a not specified overlay', function () {
            var spatialMetadataView, model = new Backbone.Model();
            spatialMetadataView = new SpatialMetadataView({el: el, model: model});

            // act
            spatialMetadataView.render();

            // assert
            expect($(el).find('.no-spatial-data-overlay').text()).toContain('Not Specified');
        });
    });
});
