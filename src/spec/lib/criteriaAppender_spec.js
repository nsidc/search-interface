import criteriaAppender from '../../lib/criteriaAppender';
import SearchResultsCollection from '../../collections/SearchResultsCollection';

describe('Criteria Appender', function () {

  describe('accessor method name generators', function () {
    it('generates accessor and mutator method names from a property name', function () {
      var propertyName = 'someProperty';
      expect(criteriaAppender.getAccessorName(propertyName)).toEqual('getSomeProperty');
    });
  });

  describe('reverse-engineering string parameters into regular expression templates', function () {
    it('replaces a capture group with a parameter', function () {
      var regex = 'keywords=(.*)';

      expect(criteriaAppender.substituteFirstCaptureGroup(regex, 'foo')).toEqual('keywords=foo');
    });
  });


  describe('generating a URL hash component from search parameters', function () {

    it('gets page numbers', function () {
      // arrange
      var routeHandlerProperties, results, generatedUrl;

      routeHandlerProperties = {
        pageNumber: 'pageNumber=(\\d+)'
      };

      results = new SearchResultsCollection();
      sinon.stub(results, 'getPageNumber').returns(4);

      // act
      generatedUrl = criteriaAppender.generateUrl(routeHandlerProperties, results);

      // assert
      expect(generatedUrl).toEqual('pageNumber=4');
    });

    it('gets items per page', function () {
      // arrange
      var routeHandlerProperties, results, generatedUrl;

      routeHandlerProperties = {
        itemsPerPage: 'itemsPerPage=(\\d+)'
      };

      results = new SearchResultsCollection();
      sinon.stub(results, 'getItemsPerPage').returns(100);

      // act
      generatedUrl = criteriaAppender.generateUrl(routeHandlerProperties, results);

      // assert
      expect(generatedUrl).toEqual('itemsPerPage=100');
    });

    it('gets keywords', function () {
      // arrange
      var routeHandlerProperties, results, generatedUrl;

      routeHandlerProperties = {
        keywords: 'keywords=(.*)'
      };

      results = new SearchResultsCollection();
      sinon.stub(results, 'getKeyword').returns(['ship']);

      // act
      generatedUrl = criteriaAppender.generateUrl(routeHandlerProperties, results);

      // assert
      expect(generatedUrl).toEqual('keywords=ship');
    });


    it('gets facet filters', function () {
      // arrange
      var routeHandlerProperties, results, generatedUrl, facetFilters, stringifiedFacets;

      facetFilters = {
        facet_data_center: [ 'National Snow and Ice Data Center | NSIDC' ]
      };
      stringifiedFacets = encodeURI(encodeURIComponent(JSON.stringify(facetFilters)));

      routeHandlerProperties = {
        facetFilters: 'facetFilters=(.*)'
      };

      results = new SearchResultsCollection();
      sinon.stub(results, 'getFacetFilters').returns(facetFilters);

      // act
      generatedUrl = criteriaAppender.generateUrl(routeHandlerProperties, results);

      // assert
      expect(generatedUrl).toEqual('facetFilters=' + stringifiedFacets);
    });

    it('must double-encode keywords, because keywords will likely contain a forward slash', function () {
      // arrange
      var routeHandlerProperties, results, generatedUrl;

      routeHandlerProperties = {
        keywords: 'keywords=(.*)'
      };

      results = new SearchResultsCollection();
      sinon.stub(results, 'getKeyword').returns(['ssm/i']);

      // act
      generatedUrl = criteriaAppender.generateUrl(routeHandlerProperties, results);

      // assert
      expect(generatedUrl).toEqual('keywords=ssm%252Fi');
    });

    it('gets multiple parameters and joins them together', function () {
      // arrange
      var routeHandlerProperties, results, generatedUrl;

      routeHandlerProperties = {
        startDate: 'startDate=(.*)',
        endDate: 'endDate=(.*)'
      };

      results = new SearchResultsCollection();
      sinon.stub(results, 'getStartDate').returns('2002');
      sinon.stub(results, 'getEndDate').returns('2012');

      // act
      generatedUrl = criteriaAppender.generateUrl(routeHandlerProperties, results);

      // assert
      expect(generatedUrl).toEqual('startDate=2002/endDate=2012');

    });

    it('does not include unused parameters in the url string', function () {
      // arrange
      var routeHandlerProperties, results, generatedUrl;

      routeHandlerProperties = {
        keywords: 'keywords=(.*)',
        startDate: 'startDate=(.*)',
        endDate: 'endDate=(.*)'
      };

      results = new SearchResultsCollection();
      sinon.stub(results, 'getKeyword').returns(['']);
      sinon.stub(results, 'getStartDate').returns('2002');
      sinon.stub(results, 'getEndDate').returns('2012');

      // act
      generatedUrl = criteriaAppender.generateUrl(routeHandlerProperties, results);

      // assert
      expect(generatedUrl).not.toContain('keywords');
    });
  });

});
