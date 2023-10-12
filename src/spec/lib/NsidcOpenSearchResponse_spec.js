import NsidcOpenSearchResponse from '../../lib/NsidcOpenSearchResponse.js';
import _ from "underscore";

describe('NsidcOpenSearchResponse', function () {
    let nsidcOpenSearchResponse = new NsidcOpenSearchResponse();
    let sortKeys = 'spatial_area,,desc';
    let fakeResponseHeader = '<feed xmlns="http://www.w3.org/2005/Atom"' +
      ' xmlns:os="http://a9.com/-/spec/opensearch/1.1/"' +
      ' xmlns:dif="http://gcmd.gsfc.nasa.gov/Aboutus/xml/dif/"' +
      ' xmlns:dc="http://purl.org/dc/elements/1.1/"' +
      ' xmlns:nsidc="http://nsidc.org/ns/opensearch/1.1/">' +
      '<title>NSIDC dataset search results</title>' +
      '<os:totalResults>1</os:totalResults>' +
      '<os:startIndex>1</os:startIndex>' +
      '<os:itemsPerPage>25</os:itemsPerPage>' +
      '<os:query role="request" nsidc:source="NSIDC" count="25" startIndex="1" searchTerms="sea ice" sortKeys="' + sortKeys + '"/>';
    let fakeResponseEntry = '<id>AuthId</id><title>dataset title</title>' +
      '<nsidc:datasetVersion>1</nsidc:datasetVersion>' +
      '<updated>2000-01-01</updated>' +
      '<temporal_duration>12345</temporal_duration>' +
      '<spatial_area>180.0</spatial_area>' +
      '<summary>dataset summary</summary>' +
      '<dc:date>1970-01-01/2000-12-31</dc:date>' +
      '<author><name>author one</name></author>' +
      '<dif:Keyword>keyword one</dif:Keyword>' +
      '<dif:Parameters><dif:Category>some category</dif:Category><dif:Topic>some topic</dif:Topic><dif:Term>some term</dif:Term>' +
      '<dif:Detailed_Variable>variable details</dif:Detailed_Variable></dif:Parameters>' +
      '<dif:Distribution><dif:Distribution_Format>stone tablet</dif:Distribution_Format></dif:Distribution>';

    // Reformat an array of date strings into a single XML string
    function dateRangesToXml(rangeList) {
        return _.map(rangeList, function(range) {
            return '<dc:date>' + range.join('/') + '</dc:date>';
        }).join(' ');
    }

    it('has a creation method from xml', function () {
        expect(nsidcOpenSearchResponse.fromXml instanceof Function).toBe(true);
    });

    it('parses the sortKeys', function () {
        let fakeResponse = fakeResponseHeader + '<entry>' + fakeResponseEntry + '</entry></feed>';
        let results = nsidcOpenSearchResponse.fromXml(fakeResponse, {osSortKeys: sortKeys});
        expect(results.getSortKeys()).toEqual(sortKeys);
    });

    describe('Parse XML response', function () {
        it('extracts OS fields from response', function () {
            let fakeResponse = fakeResponseHeader + '<entry>' + fakeResponseEntry + '</entry></feed>';
            let results = nsidcOpenSearchResponse.fromXml(fakeResponse, {});

            expect(results.getTotalCount()).toEqual(1);
            expect(results.getCurrentIndex()).toEqual(1);
            expect(results.getItemsPerPage()).toEqual(25);
            expect(results.getResults()[0].title).toMatch('dataset title');
            expect(results.getResults()[0].summary).toMatch('dataset summary');
            expect(results.getResults()[0].updated).toEqual('2000-01-01');
            expect(results.getResults()[0].author).toEqual(['author one']);
            expect(results.getResults()[0].keywords).toEqual(['keyword one']);
            expect(results.getResults()[0].parameters).toEqual(['variable details']);
            expect(results.getResults()[0].dataFormats).toEqual(['stone tablet']);
            expect(results.getResults()[0].dateRanges).toEqual([{startDate: '1970-01-01', endDate: '2000-12-31'}]);
        });

        it('extracts multiple complete date ranges', function() {
            let rangeList = [
              ['1980-01-01', '2010-12-31'],
              ['1990-01-01', '2020-12-31']
            ];
            let moreFakeRanges = dateRangesToXml(rangeList);

            let fakeResponse = fakeResponseHeader + '<entry>' +
              fakeResponseEntry + moreFakeRanges + '</entry></feed>';

            let results = nsidcOpenSearchResponse.fromXml(fakeResponse, {});
            let dateRanges = results.getResults()[0].dateRanges;
            expect(dateRanges).toBeInstanceOf(Array);
            expect(dateRanges.length).toEqual(3);
            expect(dateRanges[0].startDate).toBe('1970-01-01');
            expect(dateRanges[2].endDate).toBe('2020-12-31');
        });

        it('extracts date ranges with empty values', function() {
            let rangeList = [
                ['1980-01-01', ''],
                ['', '2020-12-31'],
                ['', '']
            ];
            let moreFakeRanges = dateRangesToXml(rangeList);
            let fakeResponse = fakeResponseHeader + '<entry>' +
              fakeResponseEntry + moreFakeRanges + '</entry></feed>';

            let results = nsidcOpenSearchResponse.fromXml(fakeResponse, {});
            let dateRanges = results.getResults()[0].dateRanges;

            expect(dateRanges.length).toEqual(4);
            expect(dateRanges[1].startDate).toBe('1980-01-01');
            expect(dateRanges[1].endDate).toBe('');
            expect(dateRanges[2].startDate).toBe('');
            expect(dateRanges[2].endDate).toBe('2020-12-31');
            expect(dateRanges[3].startDate).toBe('');
            expect(dateRanges[3].endDate).toBe('');
        });

        it('ignores date ranges with no separator character', function() {
            let fakeResponse = fakeResponseHeader + '<entry>' +
              fakeResponseEntry + '<dc:date></dc:date>' + '</entry></feed>';
            let results = nsidcOpenSearchResponse.fromXml(fakeResponse, {});
            let dateRanges = results.getResults()[0].dateRanges;
            expect(dateRanges.length).toEqual(1);
            expect(dateRanges[0].startDate).toBe('1970-01-01');

            fakeResponse = fakeResponseHeader + '<entry>' +
              fakeResponseEntry + '<dc:date>nonsense</dc:date>' + '</entry></feed>';
            results = nsidcOpenSearchResponse.fromXml(fakeResponse, {});
            dateRanges = results.getResults()[0].dateRanges;
            expect(dateRanges.length).toEqual(1);
            expect(dateRanges[0].startDate).toBe('1970-01-01');
        });

        // A few tests were updated or added as part of SRCH-94 and SRCH-51. The
        // skipped tests still need to be updated to use updated test data and to
        // run in the Jest framework.
        it.skip('extracts multiple data access links', function () {
            var results, fakeFeed, additionalEntryContents = [
                '   <link title="' + fakeDataUrls[1].title + '" href="' + fakeDataUrls[1].href +
          '" rel="download-data" nsidc:description="' + fakeDataUrls[1].description + '"/>',
            ];
            fakeFeed = fakeFeedTop.concat(fakeFeedEntryContents).concat(additionalEntryContents).concat(fakeFeedBottom).join('\n');

            results = nsidcOpenSearchResponse.fromXml(fakeFeed, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''});
            expect(results.getResults()[0].dataUrls[0].title).toEqual(fakeDataUrls[0].title);
            expect(results.getResults()[0].dataUrls[1].title).toEqual(fakeDataUrls[1].title);
            expect(results.getResults()[0].dataUrls[0].href).toEqual(fakeDataUrls[0].href);
            expect(results.getResults()[0].dataUrls[1].href).toEqual(fakeDataUrls[1].href);
            expect(results.getResults()[0].dataUrls[0].description).toEqual(fakeDataUrls[0].description);
            expect(results.getResults()[0].dataUrls[1].description).toEqual(fakeDataUrls[1].description);
        });

        it('does not set order data links if none exist', function () {
            let fakeResponse = fakeResponseHeader + '<entry>' + fakeResponseEntry + '</entry></feed>';
            var results = nsidcOpenSearchResponse.fromXml(fakeResponse, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''});
            expect(results.getResults()[0].orderDataUrl).toBeUndefined();
        });

        it.skip('extracts order data links', function () {
            var results, fakeFeed, fakeFeedEntryContents, orderDataUrl = {title: 'Order Data', href: 'http://nsidc.org/data/modis/order.html'};

            fakeFeedEntryContents = [
                '   <id>' + fakeUrl + '</id>',
                '   <title>' + fakeTitle + '</title>',
                '   <updated>' + fakeUpdated + '</updated>',
                '   <summary>' + fakeSummary + '</summary>',
                '   <link title="' + orderDataUrl.title + '" href="' + orderDataUrl.href + '" rel="order-data" />',
                '   <georss:box>-90 -180 90 180</georss:box>',
                '   <dc:date>' + fakeStart + '/' + fakeEnd + '</dc:date>',
                '   <author><name>' + fakeAuthor + '</name></author>',
                '   <dif:Parameters><dif:Category>category</dif:Category><dif:Detailed_Variable>' +
            fakeParameter + '</dif:Detailed_Variable></dif:Parameters>',
                '   <dif:Parameters><dif:Category>category2</dif:Category><dif:Detailed_Variable>' +
            fakeParameter + '</dif:Detailed_Variable></dif:Parameters>',
                '   <dif:Keyword>' + fakeKeyword + '</dif:Keyword>',
                '   <dif:Distribution><dif:Distribution_Format>' + fakeFormat +
            '</dif:Distribution_Format></dif:Distribution>'
            ];
            fakeFeed = fakeFeedTop.concat(fakeFeedEntryContents).concat(fakeFeedBottom).join('\n');

            results = nsidcOpenSearchResponse.fromXml(fakeFeed, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''});
            expect(results.getResults()[0].orderDataUrl.title).toEqual(orderDataUrl.title);
            expect(results.getResults()[0].orderDataUrl.href).toEqual(orderDataUrl.href);
        });

        it.skip('extracts brokered data links', function () {
            var results, fakeFeed, fakeFeedEntryContents,
                externalDataUrl = {title: 'Get External Data', href: 'http://data.eol.ucar.edu/codiac/dss/id=106.arcss054/'};

            fakeFeedEntryContents = [
                '   <id>' + fakeUrl + '</id>',
                '   <title>' + fakeTitle + '</title>',
                '   <updated>' + fakeUpdated + '</updated>',
                '   <summary>' + fakeSummary + '</summary>',
                '   <link title="' + externalDataUrl.title + '" href="' + externalDataUrl.href + '" rel="external-data" />',
                '   <georss:box>-90 -180 90 180</georss:box>',
                '   <dc:date>' + fakeStart + '/' + fakeEnd + '</dc:date>',
                '   <author><name>' + fakeAuthor + '</name></author>',
                '   <dif:Parameters><dif:Category>category</dif:Category><dif:Detailed_Variable>' +
            fakeParameter + '</dif:Detailed_Variable></dif:Parameters>',
                '   <dif:Parameters><dif:Category>category2</dif:Category><dif:Detailed_Variable>' +
            fakeParameter + '</dif:Detailed_Variable></dif:Parameters>',
                '   <dif:Keyword>' + fakeKeyword + '</dif:Keyword>',
                '   <dif:Distribution><dif:Distribution_Format>' + fakeFormat + '</dif:Distribution_Format></dif:Distribution>'
            ];
            fakeFeed = fakeFeedTop.concat(fakeFeedEntryContents).concat(fakeFeedBottom).join('\n');

            results = nsidcOpenSearchResponse.fromXml(fakeFeed, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''});
            expect(results.getResults()[0].externalDataUrl.title).toEqual(externalDataUrl.title);
            expect(results.getResults()[0].externalDataUrl.href).toEqual(externalDataUrl.href);
        });

        it.skip('extracts multiple data format fields from the response', function () {
            var results, fakeFeed, fakeFeedEntryContents, fakeFormats;

            fakeFormats = ['HDF, format'];

            fakeFeedEntryContents = [
                '   <id>' + fakeUrl + '</id>',
                '   <title>' + fakeTitle + '</title>',
                '   <updated>' + fakeUpdated + '</updated>',
                '   <summary>' + fakeSummary + '</summary>',
                '   <georss:box>-90 -180 90 180</georss:box>',
                '   <dc:date>' + fakeStart + '/' + fakeEnd + '</dc:date>',
                '   <dc:date>2013-07-01/2013-07-31</dc:date>',
                '   <author><name>' + fakeAuthor + '</name></author>',
                '   <dif:Parameters><dif:Category>category</dif:Category><dif:Detailed_Variable>' +
            fakeParameter + '</dif:Detailed_Variable></dif:Parameters>',
                '   <dif:Parameters><dif:Category>category2</dif:Category><dif:Detailed_Variable>' +
            fakeParameter + '</dif:Detailed_Variable></dif:Parameters>',
                '   <dif:Keyword>' + fakeKeyword + '</dif:Keyword>',
                '   <dif:Distribution><dif:Distribution_Format>' + fakeFormats + '</dif:Distribution_Format></dif:Distribution>'
            ];
            fakeFeed = fakeFeedTop.concat(fakeFeedEntryContents).concat(fakeFeedBottom).join('\n');

            results = nsidcOpenSearchResponse.fromXml(fakeFeed, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''});

            expect(results.getResults()[0].dataFormats).toEqual(['HDF, format']);
        });

        it.skip('extracts multiple temporal fields from the response', function () {
            var results, fakeFeed, fakeFeedEntryContents, fakeDateRanges;

            fakeDateRanges =  [{startDate: '2013-01-01', endDate: '2013-01-31'}, {startDate: '2013-07-01', endDate: '2013-07-31'}];

            fakeFeedEntryContents = [
                '   <id>' + fakeUrl + '</id>',
                '   <title>' + fakeTitle + '</title>',
                '   <updated>' + fakeUpdated + '</updated>',
                '   <summary>' + fakeSummary + '</summary>',
                '   <georss:box>-90 -180 90 180</georss:box>',
                '   <dc:date>' + fakeStart + '/' + fakeEnd + '</dc:date>',
                '   <dc:date>2013-07-01/2013-07-31</dc:date>',
                '   <author><name>' + fakeAuthor + '</name></author>',
                '   <dif:Parameters><dif:Category>category</dif:Category><dif:Detailed_Variable>' +
            fakeParameter + '</dif:Detailed_Variable></dif:Parameters>',
                '   <dif:Parameters><dif:Category>category2</dif:Category><dif:Detailed_Variable>' +
            fakeParameter + '</dif:Detailed_Variable></dif:Parameters>',
                '   <dif:Keyword>' + fakeKeyword + '</dif:Keyword>',
                '   <dif:Distribution><dif:Distribution_Format>' + fakeFormat + '</dif:Distribution_Format></dif:Distribution>'
            ];
            fakeFeed = fakeFeedTop.concat(fakeFeedEntryContents).concat(fakeFeedBottom).join('\n');

            results = nsidcOpenSearchResponse.fromXml(fakeFeed, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''});

            expect(results.getResults()[0].dateRanges).toEqual(fakeDateRanges);
        });

        it.skip('extracts multiple bounding box fields from the response', function () {
            var results, fakeFeed, fakeFeedEntryContents, fakeBBoxes;

            fakeBBoxes =  [{north: '90', east: '180', south: '-90', west: '-180'}, {north: '45', east: '90', south: '-45', west: '-90' }];

            fakeFeedEntryContents = [
                '   <id>' + fakeUrl + '</id>',
                '   <title>' + fakeTitle + '</title>',
                '   <updated>' + fakeUpdated + '</updated>',
                '   <summary>' + fakeSummary + '</summary>',
                '   <georss:box>-90 -180 90 180</georss:box>',
                '   <georss:box>-45 -90 45 90</georss:box>',
                '   <dc:date>' + fakeStart + '/' + fakeEnd + '</dc:date>',
                '   <author><name>' + fakeAuthor + '</name></author>',
                '   <dif:Parameters><dif:Category>category</dif:Category><dif:Detailed_Variable>' +
            fakeParameter + '</dif:Detailed_Variable></dif:Parameters>',
                '   <dif:Parameters><dif:Category>category2</dif:Category><dif:Detailed_Variable>' +
            fakeParameter + '</dif:Detailed_Variable></dif:Parameters>',
                '   <dif:Keyword>' + fakeKeyword + '</dif:Keyword>',
                '   <dif:Distribution><dif:Distribution_Format>' + fakeFormat + '</dif:Distribution_Format></dif:Distribution>'
            ];
            fakeFeed = fakeFeedTop.concat(fakeFeedEntryContents).concat(fakeFeedBottom).join('\n');

            results = nsidcOpenSearchResponse.fromXml(fakeFeed, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''});

            expect(results.getResults()[0].boundingBoxes).toEqual(fakeBBoxes);
        });

        it.skip('extracts multiple supporting programs from the response', function () {
            var results, fakeFeed, fakeFeedEntryContents, fakeSupportingPrograms  = ['NSIDC_DAAC', 'NSIDC_ELOKA'];

            fakeFeedEntryContents = [
                '   <id>' + fakeUrl + '</id>',
                '   <title>' + fakeTitle + '</title>',
                '   <updated>' + fakeUpdated + '</updated>',
                '   <summary>' + fakeSummary + '</summary>',
                '   <georss:box>-90 -180 90 180</georss:box>',
                '   <dc:date>' + fakeStart + '/' + fakeEnd + '</dc:date>',
                '   <dc:date>2013-07-01/2013-07-31</dc:date>',
                '   <author><name>' + fakeAuthor + '</name></author>',
                '   <dif:Parameters><dif:Category>category</dif:Category><dif:Detailed_Variable>' +
            fakeParameter + '</dif:Detailed_Variable></dif:Parameters>',
                '   <dif:Parameters><dif:Category>category2</dif:Category><dif:Detailed_Variable>' +
            fakeParameter + '</dif:Detailed_Variable></dif:Parameters>',
                '   <dif:Keyword>' + fakeKeyword + '</dif:Keyword>',
                '   <dif:Distribution><dif:Distribution_Format>' + fakeFormat + '</dif:Distribution_Format></dif:Distribution>',
                '   <nsidc:supportingProgram>' + fakeSupportingPrograms[0] + '</nsidc:supportingProgram>',
                '   <nsidc:supportingProgram>' + fakeSupportingPrograms[1] + '</nsidc:supportingProgram>'
            ];
            fakeFeed = fakeFeedTop.concat(fakeFeedEntryContents).concat(fakeFeedBottom).join('\n');

            results = nsidcOpenSearchResponse.fromXml(fakeFeed, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''});

            expect(results.getResults()[0].supportingPrograms[0]).toEqual(fakeSupportingPrograms[0]);
        });
    });
});
