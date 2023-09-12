import _ from "underscore";
import $ from "jquery";

// UtilityFunctions is designed to contain generic utility functions that are
// used in multiple places.

// Add a utility method to jQuery to allow us to find XML nodes quickly and efficiently.
// See http://www.steveworkman.com/html5-2/javascript/2011/improving-javascript-xml-node-finding-performance-by-2000/
$.fn.filterNode = function (name) {
    return this.find("*").filter(function () {
        return this.nodeName === name;
    });
};

export function toInitialCaps(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function toNumber(numberString, numberType, exceptionMessage) {
    if (isNaN(numberString)) {
        throw new Error(exceptionMessage);
    }

    if (numberType.toLowerCase() === "int") {
        numberString = parseInt(numberString, 10); // this also truncates decimal numbers
    } else if (numberType.toLowerCase() === "float") {
        numberString = parseFloat(numberString, 10);
    }

    return numberString;
}

export function escapeTags(string) {
    if (string === undefined) {
        return undefined;
    } else {
        string = string.replace(/&/gi, "&amp;");
        string = string.replace(/#/gi, "&#35;");
        string = string.replace(/</gi, "&lt;");
        string = string.replace(/>/gi, "&gt;");
        string = string.replace(/\(/gi, "&#40;");
        string = string.replace(/\)/gi, "&#41;");
        string = string.replace(/"/gi, "&quot;");
        string = string.replace(/'/gi, "&#39;");

        return string;
    }
}

// http://www.textfixer.com/tutorials/javascript-line-breaks.php
export function removeWhitespace(str) {
    if (str === undefined || str === "") {
        return undefined;
    } else {
        return (str.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/gm, " ")).trim();
    }
}

// http://stackoverflow.com/questions/295566/sanitize-rewrite-html-on-the-client-side
export function removeTags(html) {
    const tagBody = "(?:[^\"'>]|\"[^\"]*\"|'[^']*')*";
    const tagOrComment = new RegExp(
        "<(?:!--(?:(?:-*[^->])*--+-?)" +
      "|script\\b" +
      tagBody +
      ">[\\s\\S]*?</script\\s*" +
      "|style\\b" +
      tagBody +
      ">[\\s\\S]*?</style\\s*" +
      "|/?[a-z]" +
      tagBody +
      ")>",
        "gi"
    );

    let oldHtml;
    do {
        oldHtml = html;
        html = html.replace(tagOrComment, "");
    } while (html !== oldHtml);
    return html.replace(/</g, "&lt;");
}

export function isFloat(number) {
    const matches = /^(-)?(\d*)(\.\d*)?$/.exec(number);
    return matches ? true : false;
}

function removeEmptyElementsFromArray(array) {
    const tempArray = [];
    _.each(array, function (element) {
        if (element !== "") {
            tempArray.push(element);
        }
    });

    return tempArray;
}

/*
 * Decodes a URI and form-encoded string (encoded via
 * ' ' => '+'). All '+' characters will be replaced
 * with a ' ' and the result will be URI-decoded.
 *
 * TODO: Add unit tests
 *
 * @param {*} encodedValue: A URI and form-encoded string
 * @returns {*} A string that has been unencoded
 *
 */
export function decodedQueryParameter(encodedValue) {
    return decodeURIComponent(
        encodedValue.replace(/\+/g, "%20")
    );
}

export function round(number, precision) {
    precision = Math.abs(parseInt(precision, 10)) || 0;
    const coefficient = Math.pow(10, precision);
    return Math.round(number * coefficient) / coefficient;
}

export function getArrayFromjQueryArrayTextContents(jQueryArray) {
    let results = [];

    if (jQueryArray === null || jQueryArray === undefined || jQueryArray.length < 1) {
        return undefined;
    }

    _.each(jQueryArray, function (element) {
        let text = $(element).text();
        if (text && text.length > 0) {
            results.push(removeWhitespace(removeTags(text)));
        }
    });

    return results;
}

export function osGeoBoxToNsewObj(osGeoBox) {
    let bboxArray,
        cardinals,
        coords = {};

    if (osGeoBox === undefined || osGeoBox === "") {
        return "";
    }

    bboxArray = osGeoBox.split(",");
    cardinals = ["west", "south", "east", "north"];
    _.each(bboxArray, function (coordinate, index) {
        coords[cardinals[index]] = coordinate;
    });

    return coords;
}

export function nsewObjToIdentifier(coords) {
    if (coords.north && coords.south && coords.east && coords.west) {
        return [
            "N:" + coords.north,
            "S:" + coords.south,
            "E:" + coords.east,
            "W:" + coords.west,
        ].join(",");
    } else {
        return "";
    }
}

export function osGeoBoxToIdentifier(osGeoBox) {
    return nsewObjToIdentifier(osGeoBoxToNsewObj(osGeoBox));
}

export function osGeoBoxFromIdentifier(identifier) {
    let geoBox,
        bboxArray = [],
        coords = {},
        cardinals = ["north", "south", "east", "west"];

    if (identifier === undefined) {
        return "";
    }

    bboxArray = identifier.split(/,? *[NSEW]:/);
    bboxArray = removeEmptyElementsFromArray(bboxArray);
    if (bboxArray.length === 1) {
        return "";
    }

    _.each(bboxArray, function (coordinate, index) {
        coords[cardinals[index]] = coordinate;
    });

    geoBox = [coords.west, coords.south, coords.east, coords.north].join(",");
    return geoBox === ",,," ? "" : geoBox;
}

export function getOsParameters(model, defaultParameters) {
    let startPage = model.get('pageNumber'),
      itemsPerPage = model.get('itemsPerPage');

    return {
        osSource: defaultParameters.osSource,
        osStartIndex: (startPage - 1) * itemsPerPage + 1,
        osItemsPerPage: itemsPerPage,
        osSearchTerms: model.get('keyword'),
        osAuthor: model.get('author'),
        osParameter: model.get('parameter'),
        osSensor: model.get('sensor'),
        osTitle: model.get('title'),
        osFacetFilters: model.get('facetFilters'),
        geoBoundingBox: model.get('geoBoundingBox'),
        osGeoRel: defaultParameters.osGeoRel,
        osDtStart: model.get('startDate'),
        osDtEnd: model.get('endDate'),
        osSortKeys: model.get('sortKeys'),
        osRequestHeaders: defaultParameters.osRequestHeaders
    };
}
