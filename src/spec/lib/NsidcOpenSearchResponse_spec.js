import NsidcOpenSearchResponse from '../../lib/NsidcOpenSearchResponse';
import _ from "underscore";

describe('NsidcOpenSearchResponse', function () {
    let nsidcOpenSearchResponse = new NsidcOpenSearchResponse();
    let sortKeys = 'spatial_area,,desc';
    let fakeResponseHeader = '<feed xmlns="http://www.w3.org/2005/Atom"' +
      ' xmlns:os="http://a9.com/-/spec/opensearch/1.1/"' +
      ' xmlns:dif="http://gcmd.gsfc.nasa.gov/Aboutus/xml/dif/"' +
      ' xmlns:dc="http://purl.org/dc/elements/1.1/"' +
      ' xmlns:nsidc="http://nsidc.org/ns/opensearch/1.1/"' +
      ' xmlns:georss="http://www.georss.org/georss">' +
      '<title>NSIDC dataset search results</title>' +
      '<os:totalResults>1</os:totalResults>' +
      '<os:startIndex>1</os:startIndex>' +
      '<os:itemsPerPage>25</os:itemsPerPage>' +
      '<os:query role="request" nsidc:source="NSIDC" count="25" startIndex="1" searchTerms="sea ice" sortKeys="' + sortKeys + '"/>';

    function fakeResponseEntry(options = {}) {
        let defaults = {
            distributionFormat: 'stone tablet',
            dateRanges: [['1970-01-01', '2000-12-31']],
            bboxes: [],
            programs: [],
        }

        let mergedOpts = {...defaults, ...options};

        let response = '<id>AuthId</id><title>dataset title</title>' +
        '<nsidc:datasetVersion>1</nsidc:datasetVersion>' +
        '<updated>2000-01-01</updated>' +
        '<temporal_duration>12345</temporal_duration>' +
        '<spatial_area>180.0</spatial_area>' +
        '<summary>dataset summary</summary>';

        response += dateRangesToXml(mergedOpts.dateRanges);

        for (let bb of mergedOpts.bboxes) {
            response += '<georss:box>';
            for (let dir of ['south', 'west', 'north', 'east']) {
                response += bb[dir] + ' ';
            }
            response += '</georss:box>';
        }

        response += '<author><name>author one</name></author>' +
        '<dif:Keyword>keyword one</dif:Keyword>' +
        '<dif:Parameters><dif:Category>some category</dif:Category><dif:Topic>some topic</dif:Topic><dif:Term>some term</dif:Term>' +
        '<dif:Detailed_Variable>variable details</dif:Detailed_Variable></dif:Parameters>' +
        '<dif:Distribution><dif:Distribution_Format>' + mergedOpts.distributionFormat + '</dif:Distribution_Format></dif:Distribution>';

        for (let program of mergedOpts.programs) {
            response += '<nsidc:supportingProgram>' + program + '</nsidc:supportingProgram>';
        }

        return response;
    }

    // Reformat an array of date strings into a single XML string
    function dateRangesToXml(rangeList) {
        return _.map(rangeList, function(range) {
            return '<dc:date>' + range.join('/') + '</dc:date>';
        }).join(' ');
    }

    // Create a link element based on an online resource
    function link(resource) {
        let linktag = '<link title="' + resource.title + '" href="' + resource.href + '" rel="' + resource.rel + '" ';

        if ('description' in resource) {
            linktag += 'nsidc:description="' + resource.description + '" ';
        }

        linktag += '/>';

        return linktag
    }

    it('has a creation method from xml', function () {
        expect(nsidcOpenSearchResponse.fromXml instanceof Function).toBe(true);
    });

    it('parses the sortKeys', function () {
        let fakeResponse = fakeResponseHeader + '<entry>' + fakeResponseEntry()+ '</entry></feed>';
        let results = nsidcOpenSearchResponse.fromXml(fakeResponse, {osSortKeys: sortKeys});
        expect(results.getSortKeys()).toEqual(sortKeys);
    });

    describe('Parse XML response', function () {
        it('extracts OS fields from response', function () {
            let fakeResponse = fakeResponseHeader + '<entry>' + fakeResponseEntry()+ '</entry></feed>';
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
              fakeResponseEntry() +
              moreFakeRanges +
              '</entry></feed>';

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
              fakeResponseEntry()+ moreFakeRanges + '</entry></feed>';

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
              fakeResponseEntry()+ '<dc:date></dc:date>' + '</entry></feed>';
            let results = nsidcOpenSearchResponse.fromXml(fakeResponse, {});
            let dateRanges = results.getResults()[0].dateRanges;
            expect(dateRanges.length).toEqual(1);
            expect(dateRanges[0].startDate).toBe('1970-01-01');

            fakeResponse = fakeResponseHeader + '<entry>' +
              fakeResponseEntry()+ '<dc:date>nonsense</dc:date>' + '</entry></feed>';
            results = nsidcOpenSearchResponse.fromXml(fakeResponse, {});
            dateRanges = results.getResults()[0].dateRanges;
            expect(dateRanges.length).toEqual(1);
            expect(dateRanges[0].startDate).toBe('1970-01-01');
        });

        it('extracts multiple data access links', function () {
            let fakeOnlineResourceInfo = [
                {
                    title: 'ftp',
                    href: 'http://nsidc.org/forms/nsidc-0051_or.html',
                    rel: 'download-data',
                    description: 'Download data from the NSIDC FTP server'
                },
                {
                    title: 'polaris',
                    href: 'http://nsidc.org/data/polaris/?datasets=Sea+Ice+Concentrations' +
                      'from+Nimbus-7+SMMR+and+DMSP+SSM%2FI-SSMIS+Passive+Microwave+Data',
                    rel: 'download-data',
                    description: 'Subset, reproject and reformat data through a user interface'
                }
            ]

            let fakeResponse = fakeResponseHeader + '<entry>' +
              fakeResponseEntry()+
              link(fakeOnlineResourceInfo[0]) +
              link(fakeOnlineResourceInfo[1]) +
              '</entry></feed>'
            let results = nsidcOpenSearchResponse.fromXml(
              fakeResponse, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''}
            );

            expect(results.getResults()[0].dataUrls[0].title).toEqual(fakeOnlineResourceInfo[0].title);
            expect(results.getResults()[0].dataUrls[1].title).toEqual(fakeOnlineResourceInfo[1].title);
            expect(results.getResults()[0].dataUrls[0].href).toEqual(fakeOnlineResourceInfo[0].href);
            expect(results.getResults()[0].dataUrls[1].href).toEqual(fakeOnlineResourceInfo[1].href);
            expect(results.getResults()[0].dataUrls[0].description).toEqual(fakeOnlineResourceInfo[0].description);
            expect(results.getResults()[0].dataUrls[1].description).toEqual(fakeOnlineResourceInfo[1].description);
        });

        it('does not set order data links if none exist', function () {
            let fakeResponse = fakeResponseHeader + '<entry>' + fakeResponseEntry()+ '</entry></feed>';
            let results = nsidcOpenSearchResponse.fromXml(fakeResponse, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''});

            expect(results.getResults()[0].orderDataUrl).toBeUndefined();
        });

        it('extracts order data links', function () {
            let orderData = {title: 'Order Data', href: 'http://nsidc.org/data/modis/order.html', rel: 'order-data'};
            let fakeResponse = fakeResponseHeader + '<entry>' +
              fakeResponseEntry()+
              link(orderData) +
              '</entry></feed>';

            let results = nsidcOpenSearchResponse.fromXml(
              fakeResponse, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''}
            );

            expect(results.getResults()[0].orderDataUrl.title).toEqual(orderData.title);
            expect(results.getResults()[0].orderDataUrl.href).toEqual(orderData.href);
        });

        it('extracts brokered data links', function () {
            let externalData = {
                title: 'Get External Data',
                href: 'http://data.eol.ucar.edu/codiac/dss/id=106.arcss054/',
                rel: 'external-data'
            };
            let fakeResponse = fakeResponseHeader + '<entry>' +
              fakeResponseEntry()+
              link(externalData) +
              '</entry></feed>';
            let results = nsidcOpenSearchResponse.fromXml(
              fakeResponse, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''}
            );

            expect(results.getResults()[0].externalDataUrl.title).toEqual(externalData.title);
            expect(results.getResults()[0].externalDataUrl.href).toEqual(externalData.href);
        });

        it('extracts multiple data format fields from the response', function () {
            let fakeFormats = ['HDF, format'];
            let fakeResponse = fakeResponseHeader + '<entry>' +
              fakeResponseEntry({distributionFormat: fakeFormats}) +
              '</entry></feed>';
            let results = nsidcOpenSearchResponse.fromXml(
              fakeResponse, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''}
            );

            expect(results.getResults()[0].dataFormats).toEqual(fakeFormats);
        });

        it('extracts multiple bounding box fields from the response', function () {
            let fakeBBoxes =  [
              {north: '90', east: '180', south: '-90', west: '-180'},
                {north: '45', east: '90', south: '-45', west: '-90' }
            ];
            let fakeResponse = fakeResponseHeader + '<entry>' +
              fakeResponseEntry({bboxes: fakeBBoxes}) +
              '</entry></feed>';
            let results = nsidcOpenSearchResponse.fromXml(
              fakeResponse, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''}
            );

            expect(results.getResults()[0].boundingBoxes).toEqual(fakeBBoxes);
        });

        it('extracts multiple supporting programs from the response', function () {
            let fakeSupportingPrograms  = ['NSIDC_DAAC', 'NSIDC_ELOKA'];
            let fakeResponse = fakeResponseHeader + '<entry>' +
              fakeResponseEntry({programs: fakeSupportingPrograms}) +
              '</entry></feed>';
            let results = nsidcOpenSearchResponse.fromXml(
              fakeResponse, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''}
            );

            expect(results.getResults()[0].supportingPrograms[0]).toEqual(fakeSupportingPrograms[0]);
        });
    });
});
