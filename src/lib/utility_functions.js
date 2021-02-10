/* jshint esversion: 6 */

import _ from 'underscore';
import $ from 'jquery';

// UtilityFunctions is designed to contain generic utility functions that are
// used in multiple places.

// Add a utility method to jQuery to allow us to find XML nodes quickly and efficiently.
// See http://www.steveworkman.com/html5-2/javascript/2011/improving-javascript-xml-node-finding-performance-by-2000/
// $.fn.filterNode = function (name) {
//     return this.find('*').filter(function () {
//         return this.nodeName === name;
//     });
// };

export function toInitialCaps(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function toNumber(numberString, numberType, exceptionMessage) {
    if (isNaN(numberString)) {
        throw new Error(exceptionMessage);
    }

    if (numberType.toLowerCase() === 'int') {
        numberString = parseInt(numberString, 10);  // this also truncates decimal numbers
    } else if (numberType.toLowerCase() === 'float') {
        numberString = parseFloat(numberString, 10);
    }

    return numberString;

}

export function escapeTags(string) {
    if (string === undefined) {
        return undefined;
    } else {
        string = string.replace(/&/gi, '&amp;');
        string = string.replace(/#/gi, '&#35;');
        string = string.replace(/</gi, '&lt;');
        string = string.replace(/>/gi, '&gt;');
        string = string.replace(/\(/gi, '&#40;');
        string = string.replace(/\)/gi, '&#41;');
        string = string.replace(/"/gi, '&quot;');
        string = string.replace(/'/gi, '&#39;');

        return string;
    }
}

// http://www.textfixer.com/tutorials/javascript-line-breaks.php
export function removeWhitespace(str) {
    if (str === undefined || str === '') {
        return undefined;
    } else {
        return $.trim(str.replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/gm, ' '));
    }
}

// http://stackoverflow.com/questions/295566/sanitize-rewrite-html-on-the-client-side
export function removeTags(html) {
    const tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';
    const tagOrComment = new RegExp(
        '<(?:!--(?:(?:-*[^->])*--+-?)' +
        '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*' +
        '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*' +
        '|/?[a-z]' + tagBody + ')>', 'gi');

    let oldHtml;
    do {
        oldHtml = html;
        html = html.replace(tagOrComment, '');
    } while (html !== oldHtml);
    return html.replace(/</g, '&lt;');
}

export function isFloat(number) {
      var matches = /^(\-)?(\d*)(\.\d*)?$/.exec(number);
      return matches ? true : false;
}

export function removeEmptyElementsFromArray(array) {
      var tempArray = [];
      _.each(array, function (element) {
        if (element !== '') {
          tempArray.push(element);
        }
      });

      return tempArray;
}

export function round(number, precision) {
      precision = Math.abs(parseInt(precision, 10)) || 0;
      var coefficient = Math.pow(10, precision);
      return Math.round(number * coefficient) / coefficient;
}

export function getArrayFromjQueryArrayTextContents(jQueryArray) {
    var results = [],
        removeTags = exports.removeTags,
        removeWhitespace = exports.removeWhitespace;

    if (jQueryArray.text() === '') {
      return undefined;
    }

    _.each(jQueryArray, function (element) {
      var text = $(element).text();
      if (text && text.length > 0) {
        results.push(removeWhitespace(removeTags(text)));
      }
    });

    return results;
}

export function osGeoBoxToNsewObj(osGeoBox) {
    var bboxArray, cardinals, coords = {};

    if (osGeoBox === undefined || osGeoBox === '') {
      return '';
    }

    bboxArray = osGeoBox.split(',');
    cardinals = ['west', 'south', 'east', 'north'];
    _.each(bboxArray, function (coordinate, index) {
      coords[cardinals[index]] = coordinate;
    });

    return coords;
}

export function nsewObjToIdentifier(coords) {
    if (coords.north && coords.south && coords.east && coords.west) {
      return ['N:' + coords.north, 'S:' + coords.south, 'E:' + coords.east, 'W:' + coords.west].join(',');
    } else {
      return '';
    }
}

export function osGeoBoxToIdentifier(osGeoBox) {
    return exports.nsewObjToIdentifier(exports.osGeoBoxToNsewObj(osGeoBox));
}

export function osGeoBoxFromIdentifier(identifier) {
    var geoBox, bboxArray = [], coords = {},
        cardinals = ['north', 'south', 'east', 'west'];

    if (identifier === undefined) {
      return '';
    }

    bboxArray = identifier.split(/,?\ *[NSEW]:/);
    bboxArray = exports.removeEmptyElementsFromArray(bboxArray);
    if (bboxArray.length === 1) {
      return '';
    }

    _.each(bboxArray, function (coordinate, index) {
      coords[cardinals[index]] = coordinate;
    });

    geoBox = [coords.west, coords.south, coords.east, coords.north].join(',');
    return (geoBox === ',,,' ? '' : geoBox);
}

export function nsewObjFromIdentifier(identifier) {
    return exports.osGeoBoxToNsewObj(exports.osGeoBoxFromIdentifier(identifier));
}

