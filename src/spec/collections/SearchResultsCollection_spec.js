import Backbone from 'backbone';

import SearchResultsCollection from '../../collections/SearchResultsCollection';
import JSONResults from '../../lib/JSONResults';
import OpenSearchProvider from '../../lib/OpenSearchProvider';
import Mediator from '../../lib/Mediator';

describe('SearchResultsCollection', function () {

    var FakeOpenSearchProvider,
        provider,
        osDefaults = { osUrlEndPoint: 'some.fake.url/somewhere',
            osSearchTerms: 'default terms',
            osdd: 'fake osdd',
            osGeoBbox: { lonMin: -180, latMin: 45, lonMax: 180, latMax: 90} },
        resultsCollection,
        fakeSearchParamsModel;

    FakeOpenSearchProvider = function () {
        this.requestJSON = function (options) {
            var fakeResults = [],
                startIndex = parseInt(options.osParameters.osStartIndex, 10),
                itemsPerPage = 25,
                totalResults = 75,
                json = {};

            fakeResults.length = 25;
            if (startIndex > 51) {
                startIndex = 51;
            }

            json = new JSONResults({
                results: fakeResults,
                totalCount: totalResults,
                currentIndex: startIndex,
                itemsPerPage: itemsPerPage,
                boundingBox: osDefaults.osGeoBbox,
                geoBoundingBox: '-180,45,180,90'
            });

            options.success(json, options);
        };
    };

    provider = new FakeOpenSearchProvider();

    beforeEach(function () {

        resultsCollection = new SearchResultsCollection({
            provider : provider,
            osDefaultParameters: osDefaults,
            searchParamsModel: new Backbone.Model(),
            geoBoundingBox: '-180,45,180,90'
        });
        // The fake model is only used to simulate changes which notify the collection.
        // It does not need to be a real model for these tests.
        fakeSearchParamsModel = new Backbone.Model({pageNumber : 1, itemsPerPage : 25});
    });

    describe('Initial load has a collection', function () {
        var fakeMediator = {
            on: jest.fn(),
            trigger: jest.fn()
        };

        beforeEach(function () {
            resultsCollection.mediator = fakeMediator;
            resultsCollection.onSearchInitiated(fakeSearchParamsModel);
        });

        afterEach(function () {
            fakeMediator.on.mockRestore();
            fakeMediator.trigger.mockRestore();
        });

        it('result contains at least one value', function () {
            expect(resultsCollection.length).toBeGreaterThan(0);
        });

        it('result shows the current page is 1', function () {
            expect(resultsCollection.getPageNumber()).toBe(1);
        });

        it('result shows the current items per page is 25', function () {
            expect(resultsCollection.getItemsPerPage()).toBe(25);
        });

        it('result shows the last page is 3', function () {
            expect(resultsCollection.getLastPageNumber()).toBe(3);
        });

        it('result shows the total result count is 75', function () {
            expect(resultsCollection.getTotalResultsCount()).toBe(75);
        });

        it('result shows the default coordinates', function () {
            expect(resultsCollection.getNorth()).toBe(90);
            expect(resultsCollection.getSouth()).toBe(45);
            expect(resultsCollection.getWest()).toBe(-180);
            expect(resultsCollection.getEast()).toBe(180);
        });

    });

    describe('Server responses and processing', function () {
        var fakeMediator = {
            on: jest.fn(),
            trigger: jest.fn()
        };

        beforeEach(function () {
            resultsCollection.mediator = fakeMediator;
        });

        afterEach(function () {
            fakeMediator.on.mockRestore();
            fakeMediator.trigger.mockRestore();
        });

        it('triggers the datasets returned event', function () {
            resultsCollection.onSearchInitiated(fakeSearchParamsModel);

            expect(fakeMediator.trigger).toHaveBeenCalledTimes(3);
            expect(fakeMediator.trigger.mock.calls[0][0]).toEqual('search:complete');
            expect(fakeMediator.trigger.mock.calls[1][0]).toEqual('search:success');
            expect(fakeMediator.trigger.mock.calls[2][0]).toEqual('search:fullSearchComplete');
        });

        it('triggers the datasets refined event when facets are refined', function () {
            resultsCollection.onRefinedSearch(fakeSearchParamsModel);

            expect(fakeMediator.trigger).toHaveBeenCalledTimes(3);
            expect(fakeMediator.trigger.mock.calls[0][0]).toEqual('search:complete');
            expect(fakeMediator.trigger.mock.calls[1][0]).toEqual('search:success');
            expect(fakeMediator.trigger.mock.calls[2][0]).toEqual('search:refinedSearchComplete');
        });
    });

    describe('Changing to page 2 generates updated collection', function () {
        var fakeMediator = {
            on: jest.fn(),
            trigger: jest.fn()
        };

        beforeEach(function () {
            fakeSearchParamsModel.set({pageNumber: 2});
            resultsCollection.mediator = fakeMediator;
            resultsCollection.onSearchInitiated(fakeSearchParamsModel);
        });

        afterEach(function () {
            fakeMediator.on.mockRestore();
            fakeMediator.trigger.mockRestore();
        });

        it('result contains at least one value', function () {
            expect(resultsCollection.at(0)).toBeDefined();
        });

        it('result shows the current page is 2', function () {
            expect(resultsCollection.getPageNumber()).toBe(2);
        });

        it('result shows the last page is 3', function () {
            expect(resultsCollection.getLastPageNumber()).toBe(3);
        });
    });


    describe('updating the searchParams model triggers an update to the collection', function () {
        it('only issues one ajax update request per change to searchParams', function () {
            // there are multiple events triggered by the model when an attribute is changed: 'change', and 'change:<attribute_name>'.

            // arrange
            let spy = jest.spyOn(provider, 'requestJSON');

            // act
            fakeSearchParamsModel.set({pageNumber: 9});
            resultsCollection.onSearchInitiated(fakeSearchParamsModel);

            // assert
            expect(provider.requestJSON.mock.calls.length).toEqual(1);

            // cleanup
            spy.mockRestore();

        });
    });


    describe('searchParam model updates are correctly translated to the provider', function () {
        let spy;

        beforeEach(function () {
            spy = jest.spyOn(provider, 'requestJSON');
        });

        afterEach(function () {
            spy.mockRestore();
        });

        it('Should translate keyword to osSearchTerms when provided', function () {
            // act
            fakeSearchParamsModel.set({keyword: 'test'});
            resultsCollection.onSearchInitiated(fakeSearchParamsModel);

            // assert
            expect(spy.mock.calls[0][0].osParameters.osSearchTerms).toBe('test');
        });

        it('Should translate keyword to osAuthor when author is provided', function () {
            fakeSearchParamsModel.set({author: 'testauthor'});
            resultsCollection.onSearchInitiated(fakeSearchParamsModel);

            expect(spy.mock.calls[0][0].osParameters.osAuthor).toBe('testauthor');
        });

        it('Should translate keyword to osParameter when parameter is provided', function () {
            fakeSearchParamsModel.set({parameter: 'testparameter'});
            resultsCollection.onSearchInitiated(fakeSearchParamsModel);

            expect(spy.mock.calls[0][0].osParameters.osParameter).toBe('testparameter');
        });

        it('Should translate keyword to osParameter when parameter is provided', function () {
            fakeSearchParamsModel.set({parameter: 'testparameter'});
            resultsCollection.onSearchInitiated(fakeSearchParamsModel);

            expect(spy.mock.calls[0][0].osParameters.osParameter).toBe('testparameter');
        });

        it('Should translate keyword to osSensor when sensor is provided', function () {
            fakeSearchParamsModel.set({sensor: 'testsensor'});
            resultsCollection.onSearchInitiated(fakeSearchParamsModel);

            expect(spy.mock.calls[0][0].osParameters.osSensor).toBe('testsensor');
        });

        it('Should translate keyword to osTitle when title is provided', function () {
            fakeSearchParamsModel.set({title: 'testtitle'});
            resultsCollection.onSearchInitiated(fakeSearchParamsModel);

            expect(spy.mock.calls[0][0].osParameters.osTitle).toBe('testtitle');
        });

        it('Should translate dates to corresponding os terms when provided', function () {
            // act
            fakeSearchParamsModel.set({startDate: '2001-01-01', endDate: '2002-12-31'});
            resultsCollection.onSearchInitiated(fakeSearchParamsModel);

            // assert
            expect(spy.mock.calls[0][0].osParameters.osDtStart).toBe('2001-01-01');
            expect(spy.mock.calls[0][0].osParameters.osDtEnd).toBe('2002-12-31');
        });
    });


    describe('Search Results update the collections search information', function () {

        it('Updated search information is available through getters', function () {
            // arrange
            var fakeJson;
            var mediator = {
                on: jest.fn(),
                trigger: jest.fn()
            };
            resultsCollection.mediator = mediator;

            fakeJson = new JSONResults(
                { keyword: 'test keyword',
                    startDate: '2011-01-01',
                    endDate: '2011-12-31',
                    geoBoundingBox: '56,1,98,99'
                });

            // act
            resultsCollection.onNewSearchResultData(fakeJson);

            // assert
            expect(resultsCollection.getKeyword()).toBe('test keyword');
            expect(resultsCollection.getStartDate()).toBe('2011-01-01');
            expect(resultsCollection.getEndDate()).toBe('2011-12-31');
            expect(resultsCollection.getOsGeoBbox()).toBe('N:99,S:1,E:98,W:56');
        });
    });



    describe('Search Results Collection uses application default values when model does not have specific values.', function () {

        var defaultParams = { osdd: 'fake osdd', osGeoBbox: { lonMin: 2, latMin: 1, lonMax: 98, latMax: 99} },
            resultsCollection;

        beforeEach(function () {
            var mediator = {
                on: jest.fn(),
                trigger: jest.fn()
            };

            resultsCollection = new SearchResultsCollection({
                osDefaultParameters: defaultParams,
                searchParamsModel: new Backbone.Model()
            });

            resultsCollection.mediator = mediator;
        });

        it('Should use Model information, when it is provided rather than the defaults', function () {
            jest.mock('../../lib/JSONResults');
            let jsonResults = new JSONResults(jest.fn());
            jsonResults.getGeoBoundingBox = jest.fn();
            jsonResults.getGeoBoundingBox.mockReturnValue('stubbed Box');

            resultsCollection.onNewSearchResultData(jsonResults);

            expect(resultsCollection.getGeoBoundingBox()).toBe('stubbed Box');
            jest.unmock('../../lib/JSONResults');
        });


        describe('changing search parameters', function () {
            var defaultBbox;

            beforeEach(function () {
                defaultBbox = '-180,45,180,90';
                resultsCollection = new SearchResultsCollection({
                    osDefaultParameters: defaultParams,
                    searchParamsModel: new Backbone.Model(),
                    provider: { requestJSON: jest.fn() },
                    geoBoundingBox: defaultBbox
                });
            });

            afterEach(function () {
            });

            it('Should not change geobox parameters if another parameter changes', function () {
                // act
                var newKeywordModel = new Backbone.Model({keyword: 'new Keywords'});
                resultsCollection.onSearchInitiated(newKeywordModel);
                // assert
                expect(resultsCollection.getGeoBoundingBox()).toBe(defaultBbox);
            });

            it('Should update the geobox parameters if the model\'s geobox changes', function () {
                // arrange
                var updatedGeoBbox = '-90,55,180,60',
                    newModel = new Backbone.Model({ geoBoundingBox: updatedGeoBbox });

                // act
                resultsCollection.onSearchInitiated(newModel);
                // assert
                expect(resultsCollection.provider.requestJSON.mock.calls[0][0].osParameters.geoBoundingBox).toBe(updatedGeoBbox);
            });
        });

    });
});
