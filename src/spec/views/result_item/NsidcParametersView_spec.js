import NsidcParametersView from '../../views/result_item/NsidcParametersView';

describe('NSIDC Parameters View', function () {
  var model, el, nsidcParametersView;

  describe('Rendering', function () {
    it('should display the word Parameters when given a parameter list', function () {
      model = new Backbone.Model({ parameters: ['p1']});
      el = document.createElement('div');

      nsidcParametersView = new NsidcParametersView({el: el, model: model}).render();

      expect($(el).html()).toContain('Parameter');
    });

    it('should display the word Parameters when given an empty parameter list', function () {
      model = new Backbone.Model({});
      el = document.createElement('div');

      nsidcParametersView = new NsidcParametersView({el: el, model: model}).render();

      expect($(el).html()).toContain('Parameter');
    });

    describe('with a short parameters list', function () {
      beforeEach(function () {
        model = new Backbone.Model({ parameters: ['p1', 'p2'] });
        el = document.createElement('div');
        nsidcParametersView = new NsidcParametersView({el: el, model: model}).render();
      });

      it('should contain each parameter in the model', function () {
        expect($(el).find('.parameter').length).toBe(2);
      });
    });

    describe('with a long parameters list', function () {
      beforeEach(function () {
        model = new Backbone.Model({ parameters: ['p1', 'p2', 'p3'] });
        el = document.createElement('div');
        nsidcParametersView = new NsidcParametersView({el: el, model: model}).render();
      });

      it('should contain each parameter in the model', function () {
        expect($(el).find('.parameter').length).toBe(3);
      });
    });
  });
});
