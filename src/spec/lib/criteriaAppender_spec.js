import * as CriteriaAppender from '../../lib/criteriaAppender';
import { appRouteHandlerProperties } from '../../config/appConfig';
import SearchResultsCollection from '../../collections/SearchResultsCollection';

describe('Criteria Appender', function () {

    describe('accessor method name generators', function () {
        it('generates accessor and mutator method names from a property name', function () {
            let propertyName = 'someProperty';
            expect(CriteriaAppender.getAccessorName(propertyName)).toEqual('getSomeProperty');
        });
    });

    describe('reverse-engineering string parameters into regular expression templates', function () {
        it('replaces a capture group with a parameter', function () {
            let regex = 'keywords=(.*)';

            expect(CriteriaAppender.substituteFirstCaptureGroup(regex, 'foo')).toEqual('keywords=foo');
        });
    });


    describe('generating a URL hash component from search parameters', function () {
        it('gets page numbers', function () {
            let fakeProperties = { pageNumber: appRouteHandlerProperties['pageNumber'] };

            let fakeResults = new SearchResultsCollection();
            fakeResults.getPageNumber = jest.fn(pageNumber => 4);

            let generatedUrl = CriteriaAppender.generateUrl(fakeProperties, fakeResults);

            expect(generatedUrl).toEqual('pageNumber=4');
        });

        it('gets items per page', function () {
            let fakeProperties = { itemsPerPage: appRouteHandlerProperties['itemsPerPage'] };
            let fakeResults = new SearchResultsCollection();

            fakeResults.getItemsPerPage = jest.fn(itemsPerPage=> 100);

            let generatedUrl = CriteriaAppender.generateUrl(fakeProperties, fakeResults);

            expect(generatedUrl).toEqual('itemsPerPage=100');
        });

        it('gets keywords', function () {
            let fakeProperties = { keywords: appRouteHandlerProperties['keywords'] };
            let fakeResults = new SearchResultsCollection();

            fakeResults.getKeywords = jest.fn(keywords => 'ship');

            let generatedUrl = CriteriaAppender.generateUrl(fakeProperties, fakeResults);

            expect(generatedUrl).toEqual('keywords=ship');
        });


        it('gets facet filters', function () {
            let fakeProperties, fakeResults, fakeFacetFilters, stringifiedFacets, generatedUrl;

            fakeProperties = { facetFilters: appRouteHandlerProperties['facetFilters'] };
            fakeResults = new SearchResultsCollection();
            fakeFacetFilters = { facet_parameter: [ 'albedo' ] };

            fakeResults.getFacetFilters = jest.fn(facetFilters=> fakeFacetFilters);

            stringifiedFacets = encodeURI(encodeURIComponent(JSON.stringify(fakeFacetFilters)));

            generatedUrl = CriteriaAppender.generateUrl(fakeProperties, fakeResults);

            expect(generatedUrl).toEqual('facetFilters=' + stringifiedFacets);
            expect(generatedUrl).toMatch(/albedo/i);
        });

        it('gets multiple facet filters of the same type', function () {
            let fakeProperties, fakeResults, fakeFacetFilters, stringifiedFacets, generatedUrl;

            fakeProperties = { facetFilters: appRouteHandlerProperties['facetFilters'] };
            fakeResults = new SearchResultsCollection();
            fakeFacetFilters = { facet_parameter: [ 'albedo', 'snowflake' ] };

            fakeResults.getFacetFilters = jest.fn(facetFilters=> fakeFacetFilters);

            stringifiedFacets = encodeURI(encodeURIComponent(JSON.stringify(fakeFacetFilters)));

            generatedUrl = CriteriaAppender.generateUrl(fakeProperties, fakeResults);

            expect(generatedUrl).toEqual('facetFilters=' + stringifiedFacets);
            expect(generatedUrl).toMatch(/albedo/i);
            expect(generatedUrl).toMatch(/snowflake/i);
        });

        it('gets facet filters of different types', function () {
            let fakeProperties, fakeResults, fakeFacetFilters, stringifiedFacets, generatedUrl;

            fakeProperties = { facetFilters: appRouteHandlerProperties['facetFilters'] };
            fakeResults = new SearchResultsCollection();
            fakeFacetFilters = {
                facet_parameter: [ 'ALBEDO' ],
                facet_sponsored_program: ['National Snow and Ice Data Center | NSIDC']
            };

            fakeResults.getFacetFilters = jest.fn(facetFilters=> fakeFacetFilters);

            stringifiedFacets = encodeURI(encodeURIComponent(JSON.stringify(fakeFacetFilters)));

            generatedUrl = CriteriaAppender.generateUrl(fakeProperties, fakeResults);

            expect(generatedUrl).toEqual('facetFilters=' + stringifiedFacets);
            expect(generatedUrl).toMatch(/facet_parameter/);
            expect(generatedUrl).toMatch(/facet_sponsored_program/);
        });

        it('double-encodes keywords to handle possible forward slash', function () {
            let fakeProperties, fakeResults, generatedUrl;

            fakeProperties = { keywords: appRouteHandlerProperties['keywords'] };
            fakeResults = new SearchResultsCollection();

            fakeResults.getKeywords = jest.fn(keywords => 'ssm/i');
            generatedUrl = CriteriaAppender.generateUrl(fakeProperties, fakeResults);

            expect(generatedUrl).toEqual('keywords=ssm%252Fi');
        });

        it('gets multiple parameters and joins them together', function () {
            let fakeProperties, fakeResults, generatedUrl;

            fakeProperties = {
                startDate: appRouteHandlerProperties['startDate'],
                endDate: appRouteHandlerProperties['endDate'],
            };
            fakeResults = new SearchResultsCollection();
            fakeResults.getStartDate = jest.fn(startDate=> '2002');
            fakeResults.getEndDate = jest.fn(startDate=> '2012');
            generatedUrl = CriteriaAppender.generateUrl(fakeProperties, fakeResults);
            expect(generatedUrl).toEqual('startDate=2002/endDate=2012');
        });

        it('does not include unused parameters in the url string', function () {
            let generatedUrl;
            let fakeResults = new SearchResultsCollection();
            let fakeProperties = {
                keywords: appRouteHandlerProperties['keywords'],
                startDate: appRouteHandlerProperties['startDate'],
                endDate: appRouteHandlerProperties['endDate']
            };

            fakeResults.getKeyWords = jest.fn(keyWords=> ['']);
            fakeResults.getStartDate = jest.fn(startDate=> '2002');
            fakeResults.getEndDate = jest.fn(endDate=> '2012');
            generatedUrl = CriteriaAppender.generateUrl(fakeProperties, fakeResults);

            expect(generatedUrl).not.toContain('keywords');
            expect(generatedUrl).toContain('startDate');
        });
    });

});
