// import LeftColumnView from '../../views/left_column/LeftColumnView';
// import LogoView from '../../views/left_column/LogoView';
// import SearchResultsCollection from '../../collections/SearchResultsCollection';
// import FacetsCollection from '../../collections/FacetsCollection';
// import Mediator from '../../lib/Mediator';
// import objectFactory from '../../lib/objectFactory';
// import debug from '../../vendor/debug';

// var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };
// var createFakeModel = function () { return sinon.createStubInstance(Backbone.Model); };

// var fakeFacetsCollection = new FacetsCollection();
// var SearchParamsModel = sinon.stub().returns(createFakeModel());
// var FacetsView = sinon.stub().returns(createFakeView());

describe.skip('Left Column View', function () {

    beforeEach(function () {
    // No need to actually emit any debugger messages
        sinon.stub(debug, 'warn');

        // reset mock counts (if they exist)
        if (FacetsView.firstCall) {
            FacetsView.firstCall.returnValue.render.reset();
        }

        FacetsView.resetHistory();

        objectFactory.register('LeftColumnView', {
            Ctor: LeftColumnView,
            configOptions: {
                preset: {
                    homePage: true,
                    facets: true
                }
            }
        });
        objectFactory.register('LogoView', {Ctor: LogoView, configOptions: { preset: {templateId: 'ADE' } } });
        objectFactory.register('FacetsCollection', FacetsCollection);
        objectFactory.register('FacetsView', FacetsView);
    });

    afterEach(function () {
        debug.warn.restore();
    });

    it('creates and renders subviews', function () {
        var leftColumnView,
            fakeParamsModel,
            fakeResultsCollection;

        fakeParamsModel = new SearchParamsModel();
        fakeResultsCollection = new Backbone.Collection();

        leftColumnView = objectFactory.createInstance('LeftColumnView', {
            searchParamsModel: fakeParamsModel,
            resultsCollection: fakeResultsCollection,
            facetsCollection: fakeFacetsCollection,
        });

        // act
        leftColumnView.render();

        // assert
        expect(FacetsView).toHaveBeenCalledOnce();
        expect(FacetsView.firstCall.returnValue.render).toHaveBeenCalledOnce();
    });

    it('should create a correctly structured element as provided', function () {
    // arrange
        var element = document.createElement('div'),
            fakeCollection = new SearchResultsCollection(),
            fakeParamsModel = new SearchParamsModel(),
            leftColumnView;

        leftColumnView = objectFactory.createInstance('LeftColumnView', {
            el: element,
            searchParamsModel: fakeParamsModel,
            resultsCollection: fakeCollection,
            facetsCollection: fakeFacetsCollection
        });

        // act
        leftColumnView.render();

        // assert

        expect(leftColumnView.$el.find('.project-logo').length).toBe(1);
    });

    describe('visibility with search events', function () {
        var mediator, fakeCollection, fakeParamsModel, leftColumnView;

        beforeEach(function () {
            mediator = new Mediator();
            fakeCollection = new SearchResultsCollection();
            fakeParamsModel = new SearchParamsModel();
            leftColumnView = objectFactory.createInstance('LeftColumnView', {
                searchParamsModel: fakeParamsModel,
                resultsCollection: fakeCollection,
                facetsCollection: fakeFacetsCollection
            });

            leftColumnView.setMediator(mediator);
            leftColumnView.render();

        });

        it('should not be visible when a new search is initiated', function () {
            expect(leftColumnView.$el).not.toHaveClass('hidden');

            mediator.trigger('search:initiated');

            expect(leftColumnView.$el).toHaveClass('hidden');
        });

        it('should not be visible when a reset is hit', function () {
            expect(leftColumnView.$el).not.toHaveClass('hidden');

            mediator.trigger('search:resetClear');

            expect(leftColumnView.$el).toHaveClass('hidden');
        });

        it('should be visible when a new search is initiated by a changing facet', function () {
            mediator.trigger('search:refinedSearch');

            expect(leftColumnView.$el).not.toHaveClass('hidden');
        });

        it('should be visible when a search with facets is completed', function () {
            mediator.trigger('search:facetsReturned');
            mediator.trigger('search:fullSearchComplete');

            expect(leftColumnView.$el).not.toHaveClass('hidden');
        });

        it('should be visible when a search is canceled if there are previous results', function () {
            mediator.trigger('search:initiated');
            mediator.trigger('search:displayPreviousResults');

            expect(leftColumnView.$el).not.toHaveClass('hidden');
        });

    });
});
