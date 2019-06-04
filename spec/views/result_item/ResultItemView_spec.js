var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };

requireMock.requireWithStubs(
  {
    'views/result_item/DatacenterView': sinon.stub().returns(createFakeView()),
    'views/result_item/NsidcTemporalMetadataView': sinon.stub().returns(createFakeView()),
    'views/result_item/SpatialMetadataView': sinon.stub().returns(createFakeView()),
    'views/result_item/SummaryView': sinon.stub().returns(createFakeView()),
    'views/result_item/AuthorView': sinon.stub().returns(createFakeView())
  },
  [
    'views/result_item/ResultItemView',
    'lib/objectFactory',
    'views/result_item/NsidcTemporalMetadataView',
    'views/result_item/SpatialMetadataView',
    'views/result_item/AuthorView',
    'views/result_item/SummaryView',
    'views/result_item/DatacenterView'
  ],
  function (ResultItemView,
            objectFactory,
            TemporalMetadataView,
            SpatialMetadataView,
            AuthorView,
            SummaryView,
            DatacenterView) {

    describe('Result Item View', function () {

      // alias for the namespaced constructor
      var ensureViewWasRendered;

      ensureViewWasRendered = function (ViewStub) {
        expect(ViewStub).toHaveBeenCalledOnce();
        expect(ViewStub.returnValue.render).toHaveBeenCalledOnce();
      };

      beforeEach(function () {

        _([ DatacenterView,
            TemporalMetadataView,
            SpatialMetadataView,
            SummaryView,
            AuthorView
        ]).each(function (ViewStub) {
          ViewStub.returnValue.render.reset();
          ViewStub.reset();
        });
      });

      describe('initialization', function () {
        it('creates a correctly structured element if one is not provided', function () {
          var view = new ResultItemView();

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
          expect($(element).find('.dataset-title').children()[0]).toBe('a');
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

          _.each([ DatacenterView,
                  TemporalMetadataView,
                  SpatialMetadataView,
                  AuthorView,
                  SummaryView
                ],
                ensureViewWasRendered
                );
        });
      });
    });
  });
