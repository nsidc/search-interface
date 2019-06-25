/* global requireMock */

var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };
var createFakeModel = function () { return sinon.createStubInstance(Backbone.Model); };

define(
  [
    'views/search_criteria/SpatialCoverageView',
    'views/search_criteria/NsidcSpatialCoverageTextView',
    'lib/objectFactory'
  ],
  function (SpatialCoverageView,
            NsidcSpatialCoverageTextView,
            objectFactory) {

    var GeoBoundingBox = sinon.stub().returns(createFakeModel());
    var SpatialCoverageCompassView = sinon.stub().returns(createFakeView());
    objectFactory.register('SpatialCoverageCompassView', {Ctor: SpatialCoverageCompassView});

    describe('Spatial Coverage View', function () {
      var spatialCoverageView, stubGeoBoundingBox;

      describe('rendering', function () {
        beforeEach(function () {
          objectFactory.register('SpatialCoverageTextView', {
            Ctor: NsidcSpatialCoverageTextView,
            configOptions: { preset: { presetText: 'Click to define Lat/Lon' } }
          });

          stubGeoBoundingBox = new GeoBoundingBox();
          stubGeoBoundingBox.isSetToDefaults = sinon.stub();
          stubGeoBoundingBox.asIdentifier = sinon.stub();

          spatialCoverageView = new SpatialCoverageView({model: stubGeoBoundingBox});
          spatialCoverageView.render();
        });

        it('renders a NsidcSpatialCoverageTextView', function () {
          expect(spatialCoverageView.$el.find('#spatial-options').is('input')).toBeTruthy();
        });

        it('renders a SpatialCoverageCompassView', function () {
          expect(spatialCoverageView.$el.find('#compass-container').is('div')).toBeTruthy();
        });
      });
    });
  });
