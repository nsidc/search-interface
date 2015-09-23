define(['views/search_criteria/AcadisSpatialCoverageTextView',
       'models/GeoBoundingBox', 'models/SearchParamsModel'],
       function (AcadisSpatialCoverageTextView, GeoBoundingBox) {

  describe('ACADIS Spatial Coverage Text View ', function () {

    var element, geoBoundingBox, view;

    beforeEach(function () {
      element = document.createElement('div');
      geoBoundingBox = new GeoBoundingBox([-180, 45, 180, 90]);
      geoBoundingBox.set('south', 40);
      view = new AcadisSpatialCoverageTextView({ el: element, model: geoBoundingBox });
    });

    describe('rendering', function () {
      it('should show the geographic bounding box string from the model', function () {
        // act
        view.render();
        // assert
        expect(view.$el.html()).toContain('90.0');
        expect(view.$el.html()).toContain('40.0');
        expect(view.$el.html()).toContain('180.0');
        expect(view.$el.html()).toContain('-180.0');
      });


      it('Should be available to type into', function () {
        view.render();
        _.each({
          north: '90.0',
          south: '40.0',
          east: '180.0',
          west: '-180.0'
        }, function (value, key, list) {
          var element = view.$el.find('#spatial-options-' + key);
          expect(element).not.toBeDisabled();
          expect(element.val()).toBe(value);
        });
      });

    });

    describe('Updating view on model changes', function () {
      it('Should display new information if the model changes', function () {
        // arrange
        var newId = 'N:1.0, S:2.0, E:3.0, W:4.0';
        // act
        geoBoundingBox.setFromIdentifier(newId);
        // assert
        expect(view.$el.find('#spatial-options-north').val()).toBe('1.0');
        expect(view.$el.find('#spatial-options-south').val()).toBe('2.0');
        expect(view.$el.find('#spatial-options-east').val()).toBe('3.0');
        expect(view.$el.find('#spatial-options-west').val()).toBe('4.0');
      });

      it('Should rest the input to the default when the model is reset', function () {
        var renderSpy = sinon.spy(view, 'render');

        geoBoundingBox.resetCriteria();

        expect(geoBoundingBox.isSetToDefaults()).toBeTruthy();
        expect(renderSpy).toHaveBeenCalledOnce();
        expect(view.$el.find('#spatial-options-north').val()).toBe('90');
        expect(view.$el.find('#spatial-options-south').val()).toBe('45');
        expect(view.$el.find('#spatial-options-east').val()).toBe('180');
        expect(view.$el.find('#spatial-options-west').val()).toBe('-180');
      });

      it('updates the model when the input value is changed', function () {
        var newId = 'N:3.0, S:2.0, E:3.0, W:1.0';
        view.render();

        view.$el.find('#spatial-options-north').val('3.0');
        view.$el.find('#spatial-options-south').val('2.0');
        view.$el.find('#spatial-options-east').val('3.0');
        view.$el.find('#spatial-options-west').val('1.0');
        view.updateModelFromInputVals();

        expect(view.model.asIdentifier()).toBe(newId);
      });
    });

  });
});
