import _ from "underscore";

import FacetsResponse from "./FacetsResponse";
import NsidcOpenSearchResponse from "./NsidcOpenSearchResponse";
import SearchTerms from "./SearchTerms";
import { appConfig } from "../config/appConfig";
import { openSearchOptions } from "../config/appConfig";
import { config, discover, registerFormat } from 'opensearch-browser';

function OpenSearchProvider() {
    /** Request a JSON-formatted data of a feed from the provider.
   *  parameters:
   *    - settings: An object containing the following key/value pairs:
   *    - success: a callback function to use when the request is successful.  The
   *               function will be passed a single argument: a JSONResults object
   *               (see definition above)
   *
   *  returns:
   *    - nothing
   */
    this.requestJSON = function (options) {
        options.osParameters.osdd =
      openSearchOptions.osProvider.port == 80 ?
          `${openSearchOptions.osProvider.openSearchHost}${openSearchOptions.osdd}` :
          `${openSearchOptions.osProvider.openSearchHost}:${openSearchOptions.osProvider.port}${openSearchOptions.osdd}`;

        let onSuccess = function (jqXhr) {
            OpenSearchProvider.prototype.successHandle(jqXhr, options);
        };

        this.abortSearchRequests();

        this.queryOpenSearch(options, onSuccess, options.error);
    };

    this.queryOpenSearch = function (options, successCallback, errorCallback) {
        let osParams = options.osParameters,
            st = new SearchTerms(osParams.osSearchTerms).urlEncode(),
            facetFilters;

        facetFilters = osParams.osFacetFilters;

        if (facetFilters && !_.isEqual(facetFilters, {})) {
            facetFilters = JSON.stringify(facetFilters);
        } else {
            facetFilters = "";
        }

        config({
            useXHR: true
        });

        const searchResponseFormat = {
            parse: function(text) {
                let response = new NsidcOpenSearchResponse();
                return (response.fromXml(text, osParams));
            }
        };
        const facetFormat = {
            parse: function(text) {
                let response = new FacetsResponse(appConfig.facets.facetNames);
                return (response.fromXml(text, osParams));
            }
        };

        registerFormat('application/atom+xml', searchResponseFormat)
        registerFormat('application/nsidc:facets+xml', facetFormat)

        discover(osParams.osdd).then((service) => {
            service.search(
                {
                    searchTerms: st,
                    startIndex: osParams.osStartIndex,
                    count: osParams.osItemsPerPage,
                    "geo:box": osParams.geoBoundingBox || "",
                    "time:start": osParams.osDtStart || "",
                    "time:end": osParams.osDtEnd || "",
                    "nsidc:source": osParams.osSource,
                    "nsidc:facetFilters": encodeURIComponent(facetFilters),
                    sortKeys: osParams.osSortKeys
                },
                {
                    type: options.contentType
                }).then((results) => options.success(results))
        }).catch(errorCallback);
    };

    this.onSearchCancel = function () {
        this.abortSearchRequests();
    };

    this.holdRequest = function (xhr) {
        this.currentRequest = xhr;
    };

    this.abortSearchRequests = function () {
    // abort function with check readystate
        if (this.currentRequest && this.currentRequest.readystate !== 4) {
            this.currentRequest.abort();
            this.currentRequest = null;
        }
    };
}

export default OpenSearchProvider;
