import AdeMainView from '../../views/AdeMainView';
import Mediator from '../../lib/Mediator';
import debug from '../../vendor/debug';

var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };
var createFakeModel = function () { return sinon.createStubInstance(Backbone.Model); };

var SearchParamsModel = sinon.stub().returns(createFakeModel()),
    MainHeaderView = sinon.stub().returns(createFakeView()),
    LeftColumnView = sinon.stub().returns(createFakeView()),
    RightColumnView = sinon.stub().returns(createFakeView()),
    HomePageView = sinon.stub().returns(createFakeView()),
    LoadingResultsView = sinon.stub().returns(createFakeView()),
    SearchErrorView = sinon.stub().returns(createFakeView());

describe('Ade Main View', function () {

    var el, params, adeMainView, testConfig;

    beforeEach(function () {
        el = document.createElement('div');
        params = {
            el: el,
            searchResultsCollection: new Backbone.Collection(),
            facetsCollection: new Backbone.Collection(),
            searchParamsModel: new SearchParamsModel()
        };

        testConfig = {
            'MainHeaderView': {Ctor: MainHeaderView, defaultOptions: {templateId: '#nsidc_search-MainHeaderView-panel' } },
            'HomePageView' : {Ctor: HomePageView, defaultOptions: {templateId: 'ADE'} },
            'LeftColumnView' : {Ctor: LeftColumnView, defaultOptions: {templateId: 'ADE'} },
            'RightColumnView' : {Ctor: RightColumnView, defaultOptions: {templateId: 'ADE'} },
            'LoadingResultsView' : {Ctor: LoadingResultsView, defaultOptions: {templateId: 'ADE'} },
            'SearchErrorView': {Ctor: SearchErrorView, defaultOptions: {templateId: 'ADE'} }
        };

        _([ RightColumnView, MainHeaderView, LeftColumnView
        ]).each(function (ViewCtor) {
            ViewCtor.resetHistory();
        });

        // No need to actually emit any debugger messages
        sinon.stub(debug, 'warn');
    });

    afterEach(function () {
        debug.warn.restore();
    });

    it('Should create the correct child elements', function () {
    // arrange
        adeMainView = new AdeMainView(params);
        // act
        adeMainView.render();
        // assert
        expect($(el).find('#search-content').length).toEqual(1);
    });

    describe('search:resetClear', function () {
        var mediator;
        beforeEach(function () {
            adeMainView = new AdeMainView(params);
            mediator = new Mediator();
            adeMainView.setMediator(mediator);
            adeMainView.render();
            mediator.trigger('search:resetClear');
        });

        it('should add a reset message', function () {
            expect(adeMainView.$el.find('#content-explanation-message').length).toEqual(1);
        });

        it('should remove the reset message on a new search', function () {
            mediator.trigger('search:initiated');
            expect(adeMainView.$el.find('#content-explanation-message').length).toEqual(0);
        });

        it('should replace the current message if one already exists', function () {
            mediator.trigger('search:resetClear');
            expect(adeMainView.$el.find('#content-explanation-message').length).toEqual(1);
        });
    });

    describe('subview creation', function () {
        var viewsInstantiated = {
            'RightColumnView': RightColumnView,
            'MainHeaderView': MainHeaderView,
            'LeftColumnView': LeftColumnView,
            'HomePageView': HomePageView,
            'SearchErrorView': SearchErrorView
        };
        _.each(viewsInstantiated, function (viewCtor, viewCtorName) {

            it('Should instantiate the ' + viewCtorName + ' view', function () {
                adeMainView = new AdeMainView(params);
                adeMainView.render();
                expect(viewCtor.mock.calls.length).toBeGreaterThan(0);
            });
        });
    });
});
