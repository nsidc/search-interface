import NsidcResultItemView from '../../views/result_item/NsidcResultItemView';
import objectFactory from '../../lib/objectFactory';

var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };

describe('NSIDC Result Item View', function () {
  // alias for the namespaced constructor
  var ensureViewWasRendered;

  // stubs
  var stubList = ['TemporalMetadataView',
    'SpatialMetadataView',
    'SummaryView',
    'ParametersView',
    'DataFormatView',
    'SupportingProgramsView'];
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
      var view = new NsidcResultItemView();

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
      var feedResultView = new NsidcResultItemView({model: new Backbone.Model()});

      feedResultView.render();

      expect(feedResultView.$el.find('.result-item').length).toBe(0);
      expect(feedResultView.$el).toHaveClass('result-item');
      expect(feedResultView.$el.find('.dataset-title').length).toBe(1);
    });

    it('displays the data set\'s title of a single search result', function () {
      var feedResultView = new NsidcResultItemView({el: element, model: new Backbone.Model({title: 'Some Cold Data'})});

      feedResultView.render();

      expect($(element).find('.dataset-title a').html()).toEqual('Some Cold Data');
    });

    it('creates and renders a bunch of subviews', function () {
      var resultItemView = new NsidcResultItemView({
        model: sinon.stub(new Backbone.Model())
      });

      resultItemView.render();

      _.each(stubList, ensureViewWasRendered);
    });
  });
});
