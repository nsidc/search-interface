var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };

requireMock.requireWithStubs(
{
  'views/result_item/NsidcTemporalMetadataView': sinon.stub().returns(createFakeView()),
  'views/result_item/SpatialMetadataView': sinon.stub().returns(createFakeView()),
  'views/result_item/NsidcSummaryView': sinon.stub().returns(createFakeView()),
  'views/result_item/NsidcParametersView': sinon.stub().returns(createFakeView()),
  'views/result_item/NsidcDataFormatView': sinon.stub().returns(createFakeView()),
  'views/result_item/NsidcSupportingProgramsView': sinon.stub().returns(createFakeView())
},
[
  'views/result_item/NsidcResultItemView',
  'lib/objectFactory',
  'views/result_item/NsidcTemporalMetadataView',
  'views/result_item/SpatialMetadataView',
  'views/result_item/NsidcSummaryView',
  'views/result_item/NsidcParametersView',
  'views/result_item/NsidcDataFormatView',
  'views/result_item/NsidcSupportingProgramsView'
],
function (NsidcResultItemView,
          objectFactory,
          NsidcTemporalMetadataView,
          NsidcSpatialMetadataView,
          NsidcSummaryView,
          NsidcParametersView,
          NsidcDataFormatView,
          NsidcSupportingPrograms) {
  describe('NSIDC Result Item View', function () {
    // alias for the namespaced constructor
    var ensureViewWasRendered;

    ensureViewWasRendered = function (ViewStub) {
      expect(ViewStub).toHaveBeenCalledOnce();
      expect(ViewStub.returnValue.render).toHaveBeenCalledOnce();
    };

    beforeEach(function () {

      _([ NsidcTemporalMetadataView,
        NsidcSpatialMetadataView,
        NsidcSummaryView,
        NsidcParametersView,
        NsidcDataFormatView,
        NsidcSupportingPrograms
      ]).each(function (ViewStub) {
          ViewStub.returnValue.render.reset();
          ViewStub.reset();
        });
    });

    describe('initialization', function () {
      it('creates a correctly structured element if one is not provided', function () {
        var view = new NsidcResultItemView();

        expect(view.$el).toBe('div');
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

        _.each([ NsidcTemporalMetadataView,
          NsidcSpatialMetadataView,
          NsidcSummaryView,
          NsidcParametersView,
          NsidcDataFormatView,
          NsidcSupportingPrograms,
        ],
            ensureViewWasRendered
        );
      });
    });
  });
});
