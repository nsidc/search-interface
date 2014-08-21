define(['models/GeoBoundingBox',
        'views/search_criteria/SpatialCoverageCompassView',
        'lib/spatial_selection_map/SpatialSelectionUtilities',
        'lib/Mediator'],
       function (GeoBoundingBox,
                 SpatialCoverageCompassView,
                 SpatialSelectionUtilities,
                 Mediator) {

  describe('Spatial Coverage Compass View (box with 4 directions)', function () {
    var view, geoBoundingBox, element, bboxChangeSpy, initMapStub;

    beforeEach(function () {
      $('body').append($('<div id="olMapDiv">'));
      element = $('#olMapDiv');
      geoBoundingBox = new GeoBoundingBox([1, 2, 3, 5]);
      geoBoundingBox.set('north', 4);
      view = new SpatialCoverageCompassView({
        el: element,
        model: geoBoundingBox,
        map: {view: 'GLOBAL'},
        features: {
          projections: {
            northView: true,
            southView: true,
            globalView: true
          }
        }
      });
      initMapStub = sinon.stub(view, 'initMap');
      sinon.stub(view, 'updateMapFromModel');
      view.render();

      this.addMatchers({
        toBeDisplayed: function () {
          var notText = this.isNot ? ' not' : '',
            errorMessageElement = this.actual;

          this.message = function () {
            return 'Expected ' + errorMessageElement.html() + notText + ' to be displayed';
          };

          return errorMessageElement.css('display') !== 'none';
        }
      });
    });

    afterEach(function () {
      $('#olMapDiv').remove();
    });

    describe('Initialization', function () {
      it('Should create a correctly structured element if one is not provided', function () {
        expect(view.$el.is('div')).toBeTruthy();
      });
    });

    describe('Rendering', function () {
      it('should add a map element to the container', function () {
        //expect(view.$el.find('#map-container').children('div').length).toBe(1);
        expect(initMapStub).toHaveBeenCalled();
      });

      it('should show the North value from the model with a decimal point', function () {
        expect(view.north()).toBe(geoBoundingBox.getNorth().toFixed(1));
      });

      it('should show the South value from the model with a decimal point', function () {
        expect(view.south()).toBe(geoBoundingBox.getSouth().toFixed(1));
      });

      it('should show the East value from the model with a decimal point', function () {
        expect(view.east()).toBe(geoBoundingBox.getEast().toFixed(1));
      });

      it('should show the West value from the model with a decimal point', function () {
        expect(view.west()).toBe(geoBoundingBox.getWest().toFixed(1));
      });

      it('should have submit, cancel and reset buttons', function () {
        expect(view.$el.find('#submit-coordinates').length).toBe(1);
        expect(view.$el.find('#cancel-coordinates').length).toBe(1);
        expect(view.$el.find('.reset-coordinates').length).toBe(1);
      });

      it('has an initially hidden geospatial input element', function () {
        expect(view.$el).toHaveClass('hidden');
      });

      it('has an initially hidden corners input elements', function () {
        expect(view.$el.find('#spatialInput_corners')).toHaveClass('hidden');
      });
    });

    describe('Button event handlers with', function () {

      describe('valid bounding box', function () {
        beforeEach(function () {
          view.$el.removeClass('hidden');
          view.north('20');
          view.south('10');
          view.east('40');
          view.west('30');
        });

        it('should update the model with values from the view on submit', function () {
          view.onApplyAndClosePressed();

          expect(view.model.getNorth()).toBe(20);
          expect(view.model.getSouth()).toBe(10);
          expect(view.model.getEast()).toBe(40);
          expect(view.model.getWest()).toBe(30);

        });

        it('should leave model unchanged on cancel', function () {
          view.cancel();

          expect(view.model.getWest()).toBe(1);
          expect(view.model.getSouth()).toBe(2);
          expect(view.model.getEast()).toBe(3);
          expect(view.model.getNorth()).toBe(4);
        });

        it('should hide the compass view on cancel', function () {
          view.cancel();

          expect(view.$el).toHaveClass('hidden');
        });

        it('should update view with default values from model on reset.', function () {
          view.reset();

          expect(view.west()).toBe('1.0');
          expect(view.south()).toBe('2.0');
          expect(view.east()).toBe('3.0');
          expect(view.north()).toBe('5.0');
        });

        it('should show the default inputs on reset.', function () {
          view.reset();

          expect(view.$el.find('#northInput')).toBeDisplayed();
          expect(view.$el.find('#southInput')).toBeDisplayed();
          expect(view.$el.find('#eastInput')).toBeDisplayed();
          expect(view.$el.find('#westInput')).toBeDisplayed();
        });

        it('should not hide the view on reset.', function () {
          view.reset();

          expect(view.$el).toBeDisplayed();
        });

        it('should hide the view on submit', function () {
          view.onApplyAndClosePressed();

          expect(view.$el).toHaveClass('hidden');
        });

        it('does not display the bbox error messages', function () {
          view.validateUserInputBbox();
          view.onApplyAndClosePressed();
          expect(view.$el.find('#bbox-error-InputNotNumber')).not.toBeDisplayed();
          expect(view.$el.find('#bbox-error-southGreaterThanNorth')).not.toBeDisplayed();
          expect(view.$el.find('#bbox-error-northOutOfRange')).not.toBeDisplayed();
          expect(view.$el.find('#bbox-error-southOutOfRange')).not.toBeDisplayed();
          expect(view.$el.find('#bbox-error-eastOutOfRange')).not.toBeDisplayed();
          expect(view.$el.find('#bbox-error-westOutOfRange')).not.toBeDisplayed();
        });
      });

      describe('invalid bounding box', function () {
        beforeEach(function () {
          view.$el.removeClass('hidden');

          view.north('10');
          view.south('20');
          view.east('30');
          view.west('40');

          view.onApplyAndClosePressed();
        });

        it('should not update the model with values from the view on submit', function () {
          expect(geoBoundingBox.getWest()).toBe(1);
          expect(geoBoundingBox.getSouth()).toBe(2);
          expect(geoBoundingBox.getEast()).toBe(3);
          expect(geoBoundingBox.getNorth()).toBe(4);
        });

        it('should not hide the view on submit', function () {
          expect(view.$el).not.toHaveClass('hidden');
        });

        it('should display the latitude error when the south value is greater than the north value', function () {
          view.validateUserInputBbox();
          expect(view.$el.find('#bbox-lat-error')).toBeDisplayed();
          expect(view.$el.find('#north')).toHaveClass('highlighting');
          expect(view.$el.find('#south')).toHaveClass('highlighting');
        });

        it('should display the north/south error when the north or south value is outside the range of -90, 90', function () {
          view.north('91');
          view.onApplyAndClosePressed();

          view.validateUserInputBbox();
          expect(view.$el.find('#bbox-range-north-error')).toBeDisplayed();
          expect(view.$el.find('#north')).toHaveClass('highlighting');
        });

        it('should display the east/west error when the east or west value is outside the range of -180, 180', function () {
          view.east('191');
          view.onApplyAndClosePressed();

          view.validateUserInputBbox();
          expect(view.$el.find('#bbox-range-east-error')).toBeDisplayed();
          expect(view.$el.find('#east')).toHaveClass('highlighting');
        });

        it('should display the format error when an entered value has letters, \' or \"', function () {
          view.north('91\'3\"f');
          view.onApplyAndClosePressed();

          view.validateUserInputBbox();
          expect(view.$el.find('#bbox-format-error')).toBeDisplayed();
          expect(view.$el.find('#north')).toHaveClass('highlighting');
        });

      });
    });

    describe('Text input changes', function () {
      beforeEach(function () {
        // replace the mapBoundingBoxChanged function with a spy so that we can test the callbacks
        // and re-initialize the view
        bboxChangeSpy = sinon.spy(SpatialCoverageCompassView.prototype, 'mapBoundingBoxChanged');
        view = new SpatialCoverageCompassView({
          el: element,
          model: geoBoundingBox,
          map: {view: 'GLOBAL'},
          features: {
            projections: {
              northView: true,
              southView: true,
              globalView: true
            }
          }
        });
        sinon.stub(view, 'initMap');
        view.render();
      });

      afterEach(function () {
        // restore the spy and the view
        SpatialCoverageCompassView.prototype.mapBoundingBoxChanged.restore();
      });

      describe('Bounding box text input changes', function () {
        var mediatorStub;

        beforeEach(function () {
          mediatorStub = sinon.stub(new Mediator());

          view.north('90');
          view.south('45');
          view.east('180');
          view.west('-180');
        });

        it('should validate bounding box', function () {
          var validateSpy = sinon.spy(view, 'validateUserInputBbox');

          view.boundingBoxUpdate();

          expect(validateSpy).toHaveBeenCalled();
        });

        it('should call change map bounding box', function () {
          view.setMediator(mediatorStub);

          view.boundingBoxUpdate();

          expect(mediatorStub.trigger).toHaveBeenCalledWith('map:changeGlobalCoords');
        });

        it('should report an adjusted west coordinate to Open Layers for boxes crossing the date line', function () {
          var west = 170, east = -170,
              adjustedWest = west - 360;

          view.setMediator(mediatorStub);

          view.west(west);
          view.east(east);
          view.boundingBoxUpdate();

          expect(mediatorStub.trigger).toHaveBeenCalledWith('map:changeGlobalCoords');
          expect(mediatorStub.trigger.firstCall.args[2]).toBe(adjustedWest);
        });

        it('should not change map bounding box when input is invalid', function () {
          view.setMediator(mediatorStub);

          view.north('10');
          view.boundingBoxUpdate();

          expect(mediatorStub.trigger).not.toHaveBeenCalledWith('map:changeGlobalCoords');
        });

        it('should trigger map bounding box change event', function () {
          view.boundingBoxUpdate();

          expect(bboxChangeSpy).toHaveBeenCalledWithExactly({
            north: 90,
            west: -180,
            south: 45,
            east: 180
          });
        });
      });

      describe('Corner point text input changes', function () {
        beforeEach(function () {
          view.upperLeftLat('55.14');
          view.upperLeftLon('-94.87');
          view.lowerRightLat('64.38');
          view.lowerRightLon('-62.49');
        });

        it('should call change lat lon corner', function () {
          var mediatorStub = sinon.stub(new Mediator());
          view.setMediator(mediatorStub);

          view.coordinatesUpdate();

          expect(mediatorStub.trigger).toHaveBeenCalledWith('map:changePolarCoords');
        });

        it('should validate the corner points', function () {
          var validateSpy = sinon.spy(view, 'validateUserInputCorners');

          view.coordinatesUpdate();

          expect(validateSpy).toHaveBeenCalled();
        });
      });
    });

    describe('Map actions', function () {
      it('should update text values when bounding box changes', function () {
        view.mapBoundingBoxChanged({
          north: 90,
          west: -180,
          south: 45,
          east: 180
        });

        expect(view.north()).toBe('90.0');
        expect(view.south()).toBe('45.0');
        expect(view.east()).toBe('180.0');
        expect(view.west()).toBe('-180.0');
      });

      it('should reset defaults when selection cleared', function () {
        view.mapSelectionCleared();

        expect(view.west()).toBe('1.0');
        expect(view.south()).toBe('2.0');
        expect(view.east()).toBe('3.0');
        expect(view.north()).toBe('5.0');
      });

      it('should update corner text values when bounding box changed', function () {
        view.mapCoordinatesChanged({
          lowerRightLat: 64.38,
          lowerRightLon: -62.49,
          upperLeftLat: 55.14,
          upperLeftLon: -94.87,
        });

        expect(view.lowerRightLat()).toBe('64.38');
        expect(view.lowerRightLon()).toBe('-62.49');
        expect(view.upperLeftLat()).toBe('55.14');
        expect(view.upperLeftLon()).toBe('-94.87');
      });

    });

    describe('Change projection', function () {
      var mediatorStub;

      beforeEach(function () {
        mediatorStub = sinon.stub(new Mediator());
        view.setMediator(mediatorStub);
      });

      it('should show the corner boxes and hide the nsew when polar selected', function () {
        view.changeProjection(SpatialSelectionUtilities.PROJECTION_NAMES.EASE_GRID_NORTH);
        expect(view.$el.find('#spatialInput_corners')).not.toHaveClass('hidden');
        expect(view.$el.find('#spatialInput_nsew')).toHaveClass('hidden');
      });

      it('should hide the corner boxes and show the nsew when global selected', function () {
        view.changeProjection(SpatialSelectionUtilities.PROJECTION_NAMES.EASE_GRID_NORTH);
        view.changeProjection(SpatialSelectionUtilities.PROJECTION_NAMES.GLOBAL);
        expect(view.$el.find('#spatialInput_corners')).toHaveClass('hidden');
        expect(view.$el.find('#spatialInput_nsew')).not.toHaveClass('hidden');
      });

      it('should call switchOpenLayerMap when north polar selected', function () {
        view.northProjectionClicked();
        expect(mediatorStub.trigger).toHaveBeenCalledWith('map:reset');
      });

      it('should call switchOpenLayerMap when global selected', function () {
        view.globalProjectionClicked();
        expect(mediatorStub.trigger).toHaveBeenCalledWith('map:reset');
      });

      it('should call switchOpenLayerMap when south selected', function () {
        view.southProjectionClicked();
        expect(mediatorStub.trigger).toHaveBeenCalledWith('map:reset');
      });

    });
  });
});
