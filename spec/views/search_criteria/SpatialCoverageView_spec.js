/* global requireMock */

var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };
var createFakeModel = function () { return sinon.createStubInstance(Backbone.Model); };

requireMock.requireWithStubs(
  {
    'models/GeoBoundingBox': sinon.stub().returns(createFakeModel()),
    'views/search_criteria/SpatialCoverageCompassView': sinon.stub().returns(createFakeView())
  },
  [
    'models/GeoBoundingBox',
    'views/search_criteria/SpatialCoverageView',
    'views/search_criteria/NsidcSpatialCoverageTextView',
    'lib/objectFactory'
  ],
  function (GeoBoundingBox,
            SpatialCoverageView,
            NsidcSpatialCoverageTextView,
            objectFactory) {

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
          expect(spatialCoverageView.$el.find('#spatial-options')).toBe('input');
        });

        it('renders a SpatialCoverageCompassView', function () {
          expect(spatialCoverageView.$el.find('#compass-container')).toBe('div');
        });
      });
    });
  });
