import MainHeaderView from '../../views/MainHeaderView';

var createFakeView = function() { return sinon.createStubInstance(Backbone.View); };
var SearchCriteriaView = sinon.stub().returns(createFakeView());

describe('Main Header View', function () {

  describe('rendering the view', function () {
    var mainHeader;

    beforeEach(function () {
      SearchCriteriaView.resetHistory();
    });

    describe('rendering the ADE view', function () {
      beforeEach(function () {
        mainHeader = new MainHeaderView({templateId: 'ADE'}).render();
      });

      it('should create a correctly structured element as provided', function () {
        expect(mainHeader.$el.is('div')).toBeTruthy();
        expect(mainHeader.$el.find('#head-title').length).toBe(1);
      });

      it('should create a Search Criteria subview', function () {
        expect(SearchCriteriaView.mock.calls.length).toBe(1);
      });
    });

    describe('rendering the NSIDC view', function () {
      beforeEach(function () {
        mainHeader = new MainHeaderView({templateId: 'NSIDC'}).render();
      });

      it('should create a correctly structured element as provided', function () {
        expect(mainHeader.$el.is('div')).toBeTruthy();
        expect(mainHeader.$el.find('#globe-logo').length).toBe(1);
      });

      it('should create a Search Criteria subview', function () {
        expect(SearchCriteriaView.mock.calls.length).toBe(1);
      });
    });

    it('throws if the template ID is not supported', function () {
      mainHeader = new MainHeaderView({templateId: 'no_such_template'});
      expect(function () { mainHeader.render(); }).toThrow();
    });
  });
});
