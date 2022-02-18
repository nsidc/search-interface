import ResultItemView from '../../views/result_item/ResultItemView';
import objectFactory from '../../lib/objectFactory';

var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };

describe('Result Item View', function () {

    // alias for the namespaced constructor
    var ensureViewWasRendered;

    var stubList = ['DatacenterView',
        'TemporalMetadataView',
        'SpatialMetadataView',
        'SummaryView',
        'AuthorView'
    ];
    var stubViews = {};
    var stubViewInstances = {};

    ensureViewWasRendered = function (stubName) {
        expect(stubViews[stubName]).toHaveBeenCalledOnce();
        expect(stubViewInstances[stubName].render).toHaveBeenCalledOnce();
    };

    beforeAll(function () {
        _.each(stubList, function (stubName) {
            var fakeView = createFakeView();
            stubViews[stubName] = sinon.stub().returns(fakeView);
            stubViewInstances[stubName] = fakeView;
            objectFactory.register(stubName, {Ctor: stubViews[stubName]});
        });
    });

    beforeEach(function () {
        _.each(stubList, function (stubName) {
            stubViews[stubName].resetHistory();
            stubViewInstances[stubName].render.resetHistory();
        });
    });


    describe('initialization', function () {
        it('creates a correctly structured element if one is not provided', function () {
            var view = new ResultItemView();

            expect(view.$el.is('div')).toBeTruthy();
            expect(view.$el).toHaveClass('result-item');
        });
    });

    describe('rendering', function () {
        var element;

        beforeEach(function () {
            element = document.createElement('div');
        });

        it('adds a dataset title div to its element when it renders', function () {
            var feedResultView, searchResultsModel = sinon.stub(new Backbone.Model({title: 'foo'}));

            feedResultView = new ResultItemView({model: searchResultsModel});

            feedResultView.render();

            expect(feedResultView.$el.find('.result-item').length).toBe(0);
            expect(feedResultView.$el).toHaveClass('result-item');
            expect(feedResultView.$el.find('.results-text').children('.dataset-title').length).toBe(1);
        });

        it('displays the data set\'s title as a link for a single search result', function () {
            var feedResultView = new ResultItemView({
                el: element,
                model: new Backbone.Model({ title: 'Some Cold Data', catalogUrl: 'fakeurl.org' })
            });

            feedResultView.render();

            expect($(element).find('.dataset-title').eq(0).html()).toContain('Some Cold Data');
            expect($($(element).find('.dataset-title').children()[0]).is('a')).toBeTruthy();
        });

        it('displays the data set\'s title with \'(No Link Available)\' when url is not provided for a single search result', function () {
            var feedResultView = new ResultItemView({el: element, model: new Backbone.Model({title: 'Some Cold Data'})});

            feedResultView.render();

            expect($(element).find('.dataset-title').eq(0).html()).toContain('Some Cold Data');
            expect($(element).find('.dataset-title').eq(0).html()).toContain('(No Link Available)');
        });

        it('creates and renders a bunch of subviews', function () {
            var resultItemView = new ResultItemView({
                model: sinon.stub(new Backbone.Model())
            });

            resultItemView.render();

            _.each(stubList, ensureViewWasRendered);
        });
    });
});
