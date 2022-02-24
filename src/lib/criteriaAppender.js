import _ from "underscore";
import * as UtilityFunctions from "../lib/utility_functions";
import SearchTerms from "./SearchTerms";

function getAccessorName(propertyName) {
    return "get" + UtilityFunctions.toInitialCaps(propertyName);
}

function substituteFirstCaptureGroup(inputRegex, replacement, options) {
    let encode = true;
    if (options && options.urlEncode === false) {
        encode = false;
    }
    return inputRegex.replace(
        /\([^)]*\)/,
        encode ? encodeURI(replacement) : replacement
    );
}

// Params:
// * routerProperties - the options object from SearchApp.  Its property
// names should be regular expression strings, and its values should be
// the names of properties in the searchResults object (each property needs a
// getXXX accessor)
// * searchResults - the SearchResultsCollection object
export function generateUrl(routerProperties, searchResults) {
    let urlSegments = _.map(routerProperties, function (regex, propName) {
        let accessorFn,
            propValue,
            urlSegment,
            urlEncode = true;

        // properties should have standard accessor methods, so determine the name of the property's getX() method
        accessorFn = searchResults[getAccessorName(propName)];

        // having determined the function's name, call it, and get the prop value
        propValue = accessorFn.call(searchResults);

        if (
            _.contains(
                ["keywords", "author", "title", "sensor", "parameter"],
                propName
            )
        ) {
            propValue = encodeURI(new SearchTerms(propValue).formEncode());
            urlEncode = false;
        } else if (propName === "facetFilters") {
            // double encode facet filters so JSON values with '/' do not break
            // routing
            propValue = encodeURIComponent(JSON.stringify(propValue));
        } else if (_.contains(["p", "bbox", "psize"], propName)) {
            // deprecated url params, don't add them to url any more
            propValue = "";
        }

        urlSegment = substituteFirstCaptureGroup(regex, propValue, {
            urlEncode: urlEncode,
        });

        if (propValue !== "") {
            return urlSegment;
        } else {
            return undefined;
        }
    });

    // Strip out any 'undefined' url segments
    urlSegments = _.filter(urlSegments, function (segment) {
        return segment !== undefined;
    });

    return urlSegments.join("/");
}
