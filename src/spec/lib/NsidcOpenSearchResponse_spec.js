import NsidcOpenSearchResponse from '../../lib/NsidcOpenSearchResponse';

describe('NsidcOpenSearchResponse', function () {
  var nsidcOpenSearchResponse = new NsidcOpenSearchResponse();
  it('has a creation method from xml', function () {
    expect(nsidcOpenSearchResponse.fromXml instanceof Function).toBe(true);
  });

  describe('Parse XML repsonse', function () {
    var fakeUrl = 'nsidc.org/data/fake', fakeTitle = 'fake title',
        fakeSummary = 'fake summary', fakeBBox = {west: '-180', south: '-90', east: '180', north: '90'},
        fakeStart = '2013-01-01', fakeEnd = '2013-01-31', fakeUpdated = '2013-02-01',
        fakeDateRange = {startDate: '2013-01-01', endDate: '2013-01-31'},
        fakeAuthor = 'fake author', fakeParameter = 'parameter',
        fakeKeyword = 'keyword', fakeFormat = 'format',
        fakeDataUrls = [{title: 'ftp',
            href: 'http://nsidc.org/forms/nsidc-0051_or.html',
            description: 'Download data from the NSIDC FTP server'},
          {title: 'polaris',
            href: 'http://nsidc.org/data/polaris/?datasets=Sea+Ice+Concentrations' +
                  'from+Nimbus-7+SMMR+and+DMSP+SSM%2FI-SSMIS+Passive+Microwave+Data',
            description: 'Subset, reproject and reformat data through a user interface'}],
        fakeFeedTop = [
          '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:nsidc="http://nsidc.org/ns/opensearch/1.1/" ' +
            'xmlns:dif="http://gcmd.gsfc.nasa.gov/Aboutus/xml/dif/" xmlns:dc="http://purl.org/dc/elements/' +
            '1.1/" xmlns:georss="http://www.georss.org/georss" ' +
            'xmlns:os="http://a9.com/-/spec/opensearch/1.1/">',
          ' <os:totalResults>1</os:totalResults>',
          ' <os:startIndex>0</os:startIndex>',
          ' <os:itemsPerPage>25</os:itemsPerPage>',
          ' <entry>'
        ],
        fakeFeedEntryContents = [
          '   <id>' + fakeUrl + '</id>',
          '   <title>' + fakeTitle + '</title>',
          '   <updated>' + fakeUpdated + '</updated>',
          '   <summary>' + fakeSummary + '</summary>',
          '   <link title="' + fakeDataUrls[0].title + '" href="' + fakeDataUrls[0].href +
            '" rel="download-data" nsidc:description="' + fakeDataUrls[0].description + '"/>',
          '   <link href="' + fakeUrl + '" rel="describedBy"/>',
          '   <georss:box>-90 -180 90 180</georss:box>',
          '   <dc:date>' + fakeStart + '/' + fakeEnd + '</dc:date>',
          '   <author><name>' + fakeAuthor + '</name></author>',
          '   <dif:Parameters><dif:Category>category</dif:Category><dif:Detailed_Variable>' +
                fakeParameter + '</dif:Detailed_Variable></dif:Parameters>',
          '   <dif:Parameters><dif:Category>category2</dif:Category><dif:Detailed_Variable>' +
                fakeParameter + '</dif:Detailed_Variable></dif:Parameters>',
          '   <dif:Keyword>' + fakeKeyword + '</dif:Keyword>',
          '   <dif:Distribution><dif:Distribution_Format>' + fakeFormat + '</dif:Distribution_Format></dif:Distribution>'
        ],
        fakeFeedBottom = [
          ' </entry>',
          '</feed>'
        ],
        fakeFeed = fakeFeedTop.concat(fakeFeedEntryContents).concat(fakeFeedBottom).join('\n');


    it('extracts OS fields from response', function () {
      var results = nsidcOpenSearchResponse.fromXml(fakeFeed, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''});

      expect(results.getResults()[0].title).toEqual(fakeTitle);
      expect(results.getResults()[0].summary).toEqual(fakeSummary);
      expect(results.getResults()[0].catalogUrl).toEqual(fakeUrl);
      expect(results.getResults()[0].boundingBoxes).toEqual([fakeBBox]);
      expect(results.getResults()[0].dateRanges).toEqual([fakeDateRange]);
      expect(results.getResults()[0].updated).toEqual(fakeUpdated);
      expect(results.getResults()[0].author).toEqual([fakeAuthor]);
      expect(results.getResults()[0].keywords).toEqual([fakeKeyword]);
      expect(results.getResults()[0].parameters).toEqual([fakeParameter]);
      expect(results.getResults()[0].dataFormats).toEqual([fakeFormat]);
      expect(results.getResults()[0].dataUrls[0].title).toEqual(fakeDataUrls[0].title);
      expect(results.getResults()[0].dataUrls[0].href).toEqual(fakeDataUrls[0].href);
      expect(results.getResults()[0].dataUrls[0].description).toEqual(fakeDataUrls[0].description);
      expect(results.getTotalCount()).toEqual(1);
      expect(results.getCurrentIndex()).toEqual(0);
      expect(results.getItemsPerPage()).toEqual(25);
    });

    it('extracts multiple data access links', function () {
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
      var results = nsidcOpenSearchResponse.fromXml(fakeFeed, {osSearchTerms: '', osDtStart: '', osDtEnd: '', geoBoundingBox: ''});
      expect(results.getResults()[0].orderDataUrl).toBeUndefined();
    });

    it('extracts order data links', function () {
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

    it('extracts brokered data links', function () {
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

    it('extracts multiple data format fields from the response', function () {
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

    it('extracts multiple temporal fields from the response', function () {
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

    it('extracts multiple bounding box fields from the response', function () {
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

    it('extracts multiple supporting programs from the response', function () {
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
