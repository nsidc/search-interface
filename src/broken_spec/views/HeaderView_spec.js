// TODO: Jest is having a hard time with one of the openlayer files that's a descendent dependency.
// Giving an error about an import statement outside a module.  That may need to be figured out to
// get these tests working properly.


import HeaderView from '../../views/HeaderView.js';

// var createFakeView = function() { return sinon.createStubInstance(Backbone.View); };
// var SearchCriteriaView = sinon.stub().returns(createFakeView());

describe('Header View', function () {

    describe('rendering the view', function () {
        let mainHeader;

        beforeEach(function () {
            SearchCriteriaView.resetHistory();
        });

        describe('rendering the NSIDC view', function () {
            beforeEach(function () {
                mainHeader = new HeaderView({templateId: 'NSIDC'}).render();
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
            mainHeader = new HeaderView({templateId: 'no_such_template'});
            expect(function () { mainHeader.render(); }).toThrow();
        });
    });
});
