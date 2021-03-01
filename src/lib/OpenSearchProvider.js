import _ from 'underscore';
import FacetsResponse from './FacetsResponse';
import NsidcOpenSearchResponse from './NsidcOpenSearchResponse';
import OpenSearchlight from 'OpenSearchlight/dist/OpenSearchlight-0.4.0';
import SearchTerms from './SearchTerms';
import {appConfig} from '../config/appConfig';
import {openSearchOptions} from '../config/appConfig';

function OpenSearchProvider() {

  // TODO: remove event handling from provider?
  this.on('search:cancel', this.onSearchCancel, this);

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
   this.requestJSON = function(options) {
     // TODO add port
     options.osParameters.osdd = openSearchOptions.osProvider.openSearchHost + openSearchOptions.osdd;

     let onSuccess = function (jqXhr) {
      OpenSearchProvider.prototype.successHandle(jqXhr, options);
    };

    this.abortSearchRequests();

    this.queryOpenSearch(
        options,
        onSuccess,
        options.error);
  };

  this.queryOpenSearch = function(options, successCallback, errorCallback) {
    let osParams = options.osParameters,
        st = new SearchTerms(osParams.osSearchTerms).urlEncode(),
        title = new SearchTerms(osParams.osTitle).urlEncode(),
        parameters = new SearchTerms(osParams.osParameter).urlEncode(),
        sensors = new SearchTerms(osParams.osSensor).urlEncode(),
        authors = new SearchTerms(osParams.osAuthor).urlEncode(),
        contentType = options.contentType,
        facetFilters;

    facetFilters = osParams.osFacetFilters;

    if(facetFilters && !_.isEqual(facetFilters, {})) {
      facetFilters = JSON.stringify(facetFilters);
    }
    else {
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

  this.onSearchCancel = function() {
    this.abortSearchRequests();
  };

  this.holdRequest = function(xhr) {
    this.currentRequest = xhr;
  };

  this.abortSearchRequests = function() {
    // abort function with check readystate
    if(this.currentRequest && this.currentRequest.readystate !== 4) {
      this.currentRequest.abort();
      this.currentRequest = null;
    }
  };
}

OpenSearchProvider.prototype.successHandle = function(jqXhr, options) {
    let response;

    if(options.contentType.indexOf('facets') !== -1) {
      response = new FacetsResponse(appConfig.features.facetNames);
    }
    else {
      response = new NsidcOpenSearchResponse();
    }

    options.success(
        response.fromXml(
            jqXhr.responseText,
            options.osParameters)
    );
};

export default OpenSearchProvider;

