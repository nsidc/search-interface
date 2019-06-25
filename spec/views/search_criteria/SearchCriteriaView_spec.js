var createFakeView = function () { return sinon.createStubInstance(Backbone.View); };
var createFakeCollection = function () { return sinon.createStubInstance(Backbone.Collection); };

define(
  ['views/search_criteria/SearchCriteriaView',
   'views/search_criteria/SpatialCoverageView',
   'views/search_criteria/NsidcSpatialCoverageTextView',
   'views/search_criteria/TemporalCoverageView',
   'views/search_criteria/KeywordsView',
   'lib/Mediator',
   'lib/objectFactory',
   'text!templates/search_criteria/keywords.html'],
  function (SearchCriteriaView,
            SpatialCoverageView,
            NsidcSpatialCoverageTextView,
            TemporalCoverageView,
            KeywordsView,
            Mediator,
            objectFactory,
            keywordsTemplate) {

    var SpatialCoverageCompassView = sinon.stub().returns(createFakeView());
    var SearchResultsCollection = sinon.stub().returns(createFakeCollection());

    objectFactory.setConfig({
      'TemporalCoverageView': TemporalCoverageView,
      'SpatialCoverageView': SpatialCoverageView,
      'KeywordsView': {
        Ctor: KeywordsView,
        configOptions: {
          preset: {
            keywordsTemplate: keywordsTemplate
          }
        }
      },
      'SpatialCoverageCompassView': { Ctor: SpatialCoverageCompassView }
    });

    describe('Search Criteria View', function () {

      var searchCriteriaView, searchParameters, stubGeoBoundingBox, resultsCollection;

      beforeEach(function () {
        // No need to actually emit any debugger messages
        sinon.stub(debug, 'warn');

        objectFactory.register('SpatialCoverageTextView', {
          Ctor: NsidcSpatialCoverageTextView, configOptions: { preset: { presetText: 'Click to define Lat/Lon' } }
        });

        stubGeoBoundingBox = '1,2,3,4';
        searchParameters = {
          setCriteria: sinon.stub(),
          on: sinon.stub(),
          get: function () {
            return stubGeoBoundingBox;
          }
        };

        resultsCollection = new SearchResultsCollection({model: searchParameters});
        resultsCollection.getKeyword = sinon.stub().returns(['ice']);
        resultsCollection.getStartDate = sinon.stub().returns('2001-02-03');
        resultsCollection.getEndDate = sinon.stub().returns('2004-05-06');
        resultsCollection.getOsGeoBbox = sinon.stub().returns('N:90.0,S:45.0,E:180.0,W:-180.0');
      });

      afterEach(function () {
        debug.warn.restore();
        resultsCollection.getKeyword.resetHistory();
        resultsCollection.getStartDate.resetHistory();
        resultsCollection.getEndDate.resetHistory();
        resultsCollection.getOsGeoBbox.resetHistory();
      });

      describe('rendering', function () {
        beforeEach(function () {
          searchCriteriaView = new SearchCriteriaView({model: searchParameters, searchResultsCollection: resultsCollection});
          searchCriteriaView.render();
        });

        it('has a Find Data Now button', function () {
          expect(searchCriteriaView.$el.find('button.find-data').length).toBe(1);
        });

        it('has a Keyword input field', function () {
          expect(searchCriteriaView.$el.find('input#keyword').length).toBe(1);
        });

        it('renders a SpatialCoverageView', function () {
          expect(searchCriteriaView.$el.find('#spatial-search-box').is('div')).toBeTruthy();
        });

        it('renders a TemporalCoverageView', function () {
          expect(searchCriteriaView.$el.find('#temporal-box').is('div')).toBeTruthy();
        });
      });

      describe('search criteria actions', function () {
        var view;

        beforeEach(function () {
          stubGeoBoundingBox = '-180,45,180,90';
          searchParameters = {
            setCriteria: sinon.stub(),
            resetFacetFilters: sinon.stub(),
            on: sinon.stub(),
            get: function () {
              return stubGeoBoundingBox;
            }
          };

          view = new SearchCriteriaView({model: searchParameters, searchResultsCollection: resultsCollection});
        });

        it('updates the search term field and triggers a new search when an example term is selected', function () {
          view.render();
          sinon.stub(view, 'onFindDataPressed');

          view.onExampleSearch('iceberg');

          expect(view.getInputField('keyword')).toBe('iceberg');
          expect(view.onFindDataPressed).toHaveBeenCalled();
        });


        it('clears all inputs when the search:clearParams event is triggered', function () {
          view.render();

          view.setInputField('keyword', 'ice');
          view.setInputField('start-date', '2000-01-01');
          view.setInputField('end-date', '2001-01-01');
          view.setInputField('spatial-options', 'N:90, S:45, E:180, W:-180');

          view.onSearchClearParams();

          expect(view.getInputField('keyword')).toBe('');
          expect(view.getInputField('start-date')).toBe('');
          expect(view.getInputField('end-date')).toBe('');
          expect(view.getInputField('spatial-options')).toBe('');
        });

        describe('find data actions', function () {
          var mediator;

          beforeEach(function () {
            mediator = sinon.stub(new Mediator());

            view.setMediator(mediator);
            view.render();
          });

          it('triggers the \'search:initiated\' event when Find Data is pressed', function () {
            view.onFindDataPressed();

            expect(mediator.trigger).toHaveBeenCalledWith('search:initiated');
          });

          it('updates the geo bounding box model when Find Data is pressed', function () {
            var spatialIdentifier = 'N:80, S:24, E:91, W:-18',
              updateBboxFunc;

            updateBboxFunc = sinon.stub(view, 'updateBboxModelFromIdentifier');

            view.setInputField('spatial-options', spatialIdentifier);
            view.onFindDataPressed();

            expect(updateBboxFunc).toHaveBeenCalledWith(spatialIdentifier);
          });

          it('puts the keyword into the search parameters when Find Data is pressed, with no constraint.', function () {
            view.setInputField('keyword', 'testval');
            view.onFindDataPressed();

            expect(searchParameters.setCriteria).toHaveBeenCalled();
            expect(searchParameters.setCriteria.firstCall.args[0].keyword).toEqual(['testval']);
          });

          it('resets the facet filters when Find Data is pressed', function () {
            view.onFindDataPressed();
            expect(searchParameters.resetFacetFilters).toHaveBeenCalled();
          });

          it('triggers the app:home event when the reset link is hit', function () {
            view.options.reset = 'home';

            view.onResetSearchClicked();

            expect(mediator.trigger).toHaveBeenCalledWith('app:home');
          });

          it('triggers the search:clear event when the reset link is hit', function () {
            view.options.reset = 'clear';

            view.setInputField('keyword', 'ice');
            view.setInputField('start-date', '2000-01-01');
            view.setInputField('end-date', '2001-01-01');
            view.setInputField('spatial-options', 'N:90, S:45, E:180, W:-180');

            view.onResetSearchClicked();

            expect(mediator.trigger).toHaveBeenCalledWith('search:resetClear');
            expect(view.getInputField('keyword')).toBe('');
            expect(view.getInputField('start-date')).toBe('');
            expect(view.getInputField('end-date')).toBe('');
            expect(view.getInputField('spatial-options')).toBe('');
          });
        });

        it('puts a date start and date end in the search parameters when Find Data button is pressed', function () {
          var mediator = sinon.stub(new Mediator());
          view.setMediator(mediator);
          view.render();
          view.setInputField('start-date', '2012-04-20');
          view.setInputField('end-date', '2012-04-21');
          view.onFindDataPressed();

          expect(searchParameters.setCriteria).toHaveBeenCalled();
          expect(searchParameters.setCriteria.firstCall.args[0].startDate).toEqual('2012-04-20');
          expect(searchParameters.setCriteria.firstCall.args[0].endDate).toEqual('2012-04-21');
        });

        it('updates the input fields when the results collection is reset', function () {
          searchCriteriaView = new SearchCriteriaView({
            model: searchParameters,
            searchResultsCollection: resultsCollection
          });
          searchCriteriaView.render();

          searchCriteriaView.onSearchResultsReset();

          expect(resultsCollection.getKeyword).toHaveBeenCalledOnce();
          expect(searchCriteriaView.$el.find('input#keyword').val()).toBe('ice');
          expect(searchCriteriaView.$el.find('input#start-date').val()).toBe('2001-02-03');
          expect(searchCriteriaView.$el.find('input#end-date').val()).toBe('2004-05-06');
          expect(searchCriteriaView.$el.find('input#spatial-options').val()).toBe('');
        });

        it('updates the search term field with multiple terms correctly when the results collection is reset', function () {
          resultsCollection.getKeyword = sinon.stub().returns(['snow', 'ice', 'polar bear']);
          searchCriteriaView = new SearchCriteriaView({
            model: searchParameters,
            searchResultsCollection: resultsCollection
          });
          searchCriteriaView.render();

          searchCriteriaView.onSearchResultsReset();

          expect(resultsCollection.getKeyword).toHaveBeenCalledOnce();
          expect(searchCriteriaView.$el.find('input#keyword').val()).toBe('snow ice "polar bear"');
        });

      });

      describe('invalid dates', function () {
        beforeEach(function () {
          searchCriteriaView = new SearchCriteriaView({model: searchParameters, searchResultsCollection: resultsCollection});
          searchCriteriaView.render();
        });

        it('does not put the start and end date in the search parameters when Find Data button is pressed with invalid range', function () {
          searchCriteriaView.setInputField('start-date', '2012-04-21');
          searchCriteriaView.setInputField('end-date', '2012-04-20');
          searchCriteriaView.onFindDataPressed();
          expect(searchParameters.setCriteria).not.toHaveBeenCalled();
        });

        it('does not put the dates in the search parameters when Find Data button is pressed with invalid format', function () {
          searchCriteriaView.setInputField('start-date', '');
          searchCriteriaView.setInputField('end-date', '04-21-2012');
          searchCriteriaView.onFindDataPressed();
          expect(searchParameters.setCriteria).not.toHaveBeenCalled();
        });
      });

      describe('Keypresses inside input fields', function () {
        var searchCriteriaView, keyEvent;

        beforeEach(function () {
          searchParameters = {
            setCriteria: sinon.stub(),
            on: sinon.stub(),
            get: function () {
              return stubGeoBoundingBox;
            }
          };
          searchCriteriaView = new SearchCriteriaView({model: searchParameters, searchResultsCollection: resultsCollection});
          sinon.stub(searchCriteriaView, 'onFindDataPressed');
          keyEvent = $.Event('keypress');

          searchCriteriaView.render();
        });

        afterEach(function () {
          searchCriteriaView.onFindDataPressed.restore();
        });

        it('triggers the search when enter is pressed inside the keyword input', function () {
          keyEvent.which = 13;  // enter key

          searchCriteriaView.$el.find('#keyword').trigger(keyEvent);

          expect(searchCriteriaView.onFindDataPressed).toHaveBeenCalled();
        });

        it('triggers the search when enter is pressed inside the spatial input', function () {
          keyEvent.which = 13;  // enter key

          searchCriteriaView.$el.find('#spatial-options').trigger(keyEvent);

          expect(searchCriteriaView.onFindDataPressed).toHaveBeenCalled();
        });

        it('triggers the search when enter is pressed inside the start-date input', function () {
          keyEvent.which = 13;  // enter key

          searchCriteriaView.$el.find('#start-date').trigger(keyEvent);

          expect(searchCriteriaView.onFindDataPressed).toHaveBeenCalled();
        });

        it('triggers the search when enter is pressed inside the end-date input', function () {
          keyEvent.which = 13;  // enter key

          searchCriteriaView.$el.find('#end-date').trigger(keyEvent);

          expect(searchCriteriaView.onFindDataPressed).toHaveBeenCalled();
        });

        it('Does not trigger the search if a letter is pressed inside a text box', function () {
          keyEvent.which = 65;  // letter a

          searchCriteriaView.$el.find('#keyword').trigger(keyEvent);

          expect(searchCriteriaView.onFindDataPressed.callCount).toBe(0);
        });

        it('Does not trigger the search if tab is pressed inside a text box', function () {
          keyEvent.which = 9;  // tab

          searchCriteriaView.$el.find('#keyword').trigger(keyEvent);

          expect(searchCriteriaView.onFindDataPressed.callCount).toBe(0);
        });

      });

    });
  }
);
