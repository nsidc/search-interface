import UpdatedView from '../../views/result_item/UpdatedView';

describe('Updated View', function () {

  var updatedView, updatedModel, element, updated;

  describe('with no updated element', function () {
    beforeEach(function () {
      updatedModel = new Backbone.Model();
      element = document.createElement('div');
      updatedView = new UpdatedView({el: element, model: updatedModel});
    });

    it('should have an empty updated div', function () {
      updatedView.render();
      expect($(element).find('.updated').text().length).toEqual(0);
    });

  });

  describe('with updated element', function () {
    beforeEach(function () {
      updated = '1981-01-06';
      updatedModel = new Backbone.Model({updated: updated});
      element = document.createElement('div');
      updatedView = new UpdatedView({el: element, model: updatedModel});
    });

    it('displays the updated date', function () {
      updatedView.render();
      expect($(element).html()).toContain('1981-01-06');
    });
  });
});
