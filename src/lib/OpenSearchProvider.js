/*globals OpenSearchlight */
// implementation of a simple, single-request OpenSearchProvider

define(['lib/RequestProvider',
        'lib/SearchTerms',
        'lib/NsidcOpenSearchResponse',
        'lib/objectFactory'],
        function (RequestProvider,
                  SearchTerms,
                  NsidcOpenSearchResponse,
                  objectFactory) {

  var OpenSearchProvider = function () {

   /** Request a JSON-formatted data of a feed from the provider.
    *  parameters:
    *    - settings: An object containing the following key/value pairs:
    *                  - success: a callback function to use when the request is successful.  The
    *                             function will be passed a single argument: a JSONResults object
    *                             (see definition above)
    *
    *  returns:
    *    - nothing
    */
    this.requestJSON = function (options) {
      var onSuccess = function (jqXhr) {
        OpenSearchProvider.prototype.successHandle(jqXhr, options);
      };

      this.abortSearchRequests();

      this.queryOpenSearch(
          options,
          onSuccess,
          options.error);
    };

    this.queryOpenSearch = function (options, successCallback, errorCallback) {
      var osParams = options.osParameters,
          st = new SearchTerms(osParams.osSearchTerms).urlEncode(),
          title = new SearchTerms(osParams.osTitle).urlEncode(),
          parameters = new SearchTerms(osParams.osParameter).urlEncode(),
          sensors = new SearchTerms(osParams.osSensor).urlEncode(),
          authors = new SearchTerms(osParams.osAuthor).urlEncode(),
          contentType = options.contentType,
          facetFilters;

      facetFilters = osParams.osFacetFilters;

      if (facetFilters && !_.isEqual(facetFilters, {})) {
        facetFilters = JSON.stringify(facetFilters);
      } else {
        facetFilters = '';
      }

      OpenSearchlight.query({
        osdd: osParams.osdd,
        contentType: contentType,
        requestHeaders: osParams.osRequestHeaders,
        parameters: {
          searchTerms: st,
          'nsidc:title': title,
          'nsidc:parameters': parameters,
          'nsidc:sensors': sensors,
          'nsidc:authors': authors,
          startIndex: osParams.osStartIndex,
          count: osParams.osItemsPerPage,
          'geo:box': osParams.geoBoundingBox || '',
          'geo:relation': osParams.osGeoRel,
          'time:start': osParams.osDtStart || '',
          'time:end': osParams.osDtEnd || '',
          'nsidc:source': osParams.osSource,
          'nsidc:facetFilters': encodeURIComponent(facetFilters),
          'sortKeys': osParams.osSortKeys
        },
        success: successCallback,
        error: errorCallback,
        queryXhr: this.holdRequest
      });
    };

    this.onSearchCancel = function () {
      this.abortSearchRequests();
    };

    this.mediatorBind('search:cancel', this.onSearchCancel, this);
  };

  OpenSearchProvider.prototype = new RequestProvider();

  OpenSearchProvider.prototype.successHandle = function (jqXhr, options) {
    var response;

    this.mediatorTrigger('search:success');

    if (options.contentType.indexOf('facets') !== -1) {
      response = objectFactory.createInstance('FacetsResponse');
    } else {
      response = new NsidcOpenSearchResponse();
    }

    options.success(
      response.fromXml(
        jqXhr.responseText,
        options.osParameters)
    );
  };

  return OpenSearchProvider;

});
