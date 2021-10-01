import FacetsResponse from '../../lib/FacetsResponse';

describe('FacetsResponse', function () {
  var facetsResponse,
    osParameters = {osSearchTerms: 'terms', osDtStart: 'start', osDtEnd: 'end', geoBoundingBox: 'box'},
    fakeXmlResponse = '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:os="http://a9.com/-/spec/opensearch/1.1/" ' +
    'xmlns:dif="http://gcmd.gsfc.nasa.gov/Aboutus/xml/dif/" xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
    'xmlns:nsidc="http://nsidc.org/ns/opensearch/1.1/" xmlns:time="http://a9.com/-/opensearch/extensions/time/1.0/" ' +
    'xmlns:geo="http://a9.com/-/opensearch/extensions/geo/1.0/" xmlns:georss="http://www.georss.org/georss">' +
    '<title>NSIDC facets results</title>' +
    '<updated>2014-02-24T14:21:47.133-07:00</updated>' +
    '<author>' +
      '<name>nsidc.org</name>' +
      '<email>nsidc@nsidc.org</email>' +
      '<uri>http://nsidc.org</uri>' +
    '</author>' +
    '<id>http://localhost:18081/api/dataset/2/Facets?' +
      'searchTerms=ice%20extent&amp;ti?x=1&amp;count=25&amp;source=NSIDC&amp;facetFilters=&amp;sortKeys=undefined</id>' +
    '<link href="http://localhost:18081/api/dataset/2/Facets?' +
      'searchTerms=ice%20extent&amp;ti?x=1&amp;count=25&amp;source=NSIDC&amp;facetFilters=&amp;sortKeys=undefined" rel="self"/>' +
    '<link href="http://localhost:18081/api/dataset/2/OpenSearchDescription" ' +
      'rel="search" type="application/opensearchdescription+xml"/>' +
    '<os:totalResults>4</os:totalResults>' +
    '<os:query role="request" nsidc:source="NSIDC" count="25" startIndex="1" ' +
      'nsidc:query="facets" searchTerms="ice extent" sortKeys="undefined"/>' +
    '<nsidc:facet name="facet_test_values">' +
      '<nsidc:facet_value name="test 1" hits="10"/>' +
      '<nsidc:facet_value name="test 2" hits="9"/>' +
      '<nsidc:facet_value name="test 3" hits="8"/>' +
    '</nsidc:facet>' +
    '<nsidc:facet name="facet_short_long_names">' +
      '<nsidc:facet_value name="Short|Long" hits="15"/>' +
      '<nsidc:facet_value name="Not So Short|Really Really Long Name" hits="68"/>' +
    '</nsidc:facet>' +
    '<nsidc:facet name="id_conversion_facet">' +
      '<nsidc:facet_value name="&lt; 1 year" hits="15"/>' +
      '<nsidc:facet_value name="NSIDC U.S. Antarctic Data Coordination Center | USADCC" hits="10"/>' +
      '<nsidc:facet_value name=" Starts With invalid characeter" hits="68"/>' +
      '<nsidc:facet_value name="10+ years" hits="68"/>' +
    '</nsidc:facet>' +
    '</feed>';


  describe('default config', function () {
    var facets;

    beforeEach(function () {
      facetsResponse = new FacetsResponse({config: null});
      facets = facetsResponse.fromXml(fakeXmlResponse, osParameters);
    });

    it('parses the xml and returns a JSONFacets with the correct ids and names', function () {
      expect(facets.getFacets()[0].id).toBe('facet_test_values');
      expect(facets.getFacets()[0].name).toBe('Test Values');
      expect(facets.getFacets()[1].id).toBe('facet_short_long_names');
      expect(facets.getFacets()[1].name).toBe('Short Long Names');
    });

    it('parses the xml and returns a JSONFacets with values set', function () {
      expect(facets.getFacets()[0].values.length).toBe(3);
      expect(facets.getFacets()[0].values[0]).toEqual({
        id: 'test_1',
        fullName: 'test 1',
        longName: 'test 1',
        shortName: 'test 1',
        count: '10'
      });
    });

    it('parses short and long names', function () {
      expect(facets.getFacets()[1].values.length).toBe(2);
      expect(facets.getFacets()[1].values[0]).toEqual({
        id: 'Short--Long',
        fullName: 'Short|Long',
        longName: 'Short',
        shortName: 'Long',
        count: '15'
      });
      expect(facets.getFacets()[1].values[1]).toEqual({
        id: 'Not_So_Short--Really_Really_Long_Name',
        fullName: 'Not So Short|Really Really Long Name',
        longName: 'Not So Short',
        shortName: 'Really Really Long Name',
        count: '68'
      });
    });

    describe('generating ids', function () {
      it('Replaces < and space characters with text', function () {
        expect(facets.getFacets()[2].values[0].id).toEqual('lt_1_year');
      });

      it('Replaces | charaters with -- and removes . characters', function () {
        expect(facets.getFacets()[2].values[1].id).toEqual('NSIDC_US_Antarctic_Data_Coordination_Center_--_USADCC');
      });

      it('forces ids to start with a letter (a-zA-Z)', function () {
        expect(facets.getFacets()[2].values[2].id).toEqual('a_Starts_With_invalid_characeter');
      });

      it('Replaces + charaters with plus', function () {
        expect(facets.getFacets()[2].values[3].id).toEqual('a10plus_years');
      });
    });
  });

  describe('overriding facet title names', function () {
    it('overrides the facet title names when set', function () {
      facetsResponse = new FacetsResponse({ nameMap: { facet_test_values: 'New Facet Title' } });
      var facets = facetsResponse.fromXml(fakeXmlResponse, osParameters);
      expect(facets.getFacets()[0].id).toBe('facet_test_values');
      expect(facets.getFacets()[0].name).toBe('New Facet Title');
    });
  });
});
