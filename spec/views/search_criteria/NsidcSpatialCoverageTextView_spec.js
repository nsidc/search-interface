define(['views/search_criteria/NsidcSpatialCoverageTextView',
       'models/GeoBoundingBox', 'models/SearchParamsModel'],
       function (NsidcSpatialCoverageTextView, GeoBoundingBox) {

  describe('NSIDC Spatial Coverage Text View ', function () {

    var element, geoBoundingBox, view;

    beforeEach(function () {
      element = document.createElement('div');
      geoBoundingBox = new GeoBoundingBox([-180, 45, 180, 90]);
      geoBoundingBox.set('south', 40);
      view = new NsidcSpatialCoverageTextView({ el: element, model: geoBoundingBox });
    });

    describe('rendering', function () {
      it('should show the geographic bounding box string from the model', function () {
        // act
        view.render();
        // assert
        expect(view.$el.html()).toContain('N:90.0, S:40.0, E:180.0, W:-180.0');
      });


      it('Should be available to type into', function () {
        view.render();
        var element = view.$el.find('#spatial-options');
        expect(element).not.toBeDisabled();
        expect(element.val()).toBe('N:90.0, S:40.0, E:180.0, W:-180.0');
      });


    });

    describe('Updating view on model changes', function () {
      it('Should display new information if the model changes', function () {
        // arrange
        var newId = 'N:1.0, S:2.0, E:3.0, W:4.0';
        // act
        geoBoundingBox.setFromIdentifier(newId);
        // assert
        expect(view.$el.find('#spatial-options').val()).toBe(newId);
      });

      it('Should clear the input when the model is reset', function () {
        var renderSpy = sinon.spy(view, 'render');

        geoBoundingBox.resetCriteria();

        expect(geoBoundingBox.isSetToDefaults()).toBeTruthy();
        expect(renderSpy).toHaveBeenCalledOnce();
        expect(view.$el.find('#spatial-options').val()).toBe('');
      });

      it('updates the model when the input value is changed', function () {
        var newId = 'N:3.0, S:2.0, E:3.0, W:1.0';
        view.render();

        view.$el.find('#spatial-options').val(newId);
        view.updateModelFromInputVal();

        expect(view.model.asIdentifier()).toBe(newId);
      });
    });

  });
});
