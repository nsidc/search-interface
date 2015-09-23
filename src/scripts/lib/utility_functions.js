// UtilityFunctions is designed to contain generic utility functions that are
// used in multiple places.

define(function () {
  var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*',
    tagOrComment = new RegExp(
      '<(?:!--(?:(?:-*[^->])*--+-?)' +
      '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*' +
      '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*' +
      '|/?[a-z]' + tagBody + ')>', 'gi');

  // Add a utility method to jQuery to allow us to find XML nodes quickly and efficiently.
  // See http://www.steveworkman.com/html5-2/javascript/2011/improving-javascript-xml-node-finding-performance-by-2000/
  $.fn.filterNode = function (name) {
    return this.find('*').filter(function () {
      return this.nodeName === name;
    });
  };

  var exports = {
    toInitialCaps : function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },

    toNumber : function (numberString, numberType, exceptionMessage) {
      if (isNaN(numberString)) {
        throw new Error(exceptionMessage);
      }

      if (numberType.toLowerCase() === 'int') {
        numberString = parseInt(numberString, 10);  // this also truncates decimal numbers
      } else if (numberType.toLowerCase() === 'float') {
        numberString = parseFloat(numberString, 10);
      }

      return numberString;

    },

    escapeTags : function (string) {
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
    },

    // http://www.textfixer.com/tutorials/javascript-line-breaks.php
    removeWhitespace : function (str) {
      if (str === undefined || str === '') {
        return undefined;
      } else {
        return $.trim(str.replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/gm, ' '));
      }
    },

    // http://stackoverflow.com/questions/295566/sanitize-rewrite-html-on-the-client-side
    removeTags : function (html) {
      var oldHtml;
      do {
        oldHtml = html;
        html = html.replace(tagOrComment, '');
      } while (html !== oldHtml);
      return html.replace(/</g, '&lt;');
    },

    isFloat: function (number) {
      var matches = /^(\-)?(\d*)(\.\d*)?$/.exec(number);
      return matches ? true : false;
    },

    removeEmptyElementsFromArray : function (array) {
      var tempArray = [];
      _.each(array, function (element) {
        if (element !== '') {
          tempArray.push(element);
        }
      });

      return tempArray;
    },

    round : function (number, precision) {
      precision = Math.abs(parseInt(precision, 10)) || 0;
      var coefficient = Math.pow(10, precision);
      return Math.round(number * coefficient) / coefficient;
    }
  };

  exports.getArrayFromjQueryArrayTextContents = function (jQueryArray) {
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
  };

  exports.normalizeDate = function (dateString) {
    if (dateString && dateString.length && dateString.length > 0) {
      dateString = exports.removeWhitespace(dateString);
      // Accept only ISO formatted dates
      if (moment(dateString).isValid()) {
        return dateString.substr(0, 10);
      }
    }
    return undefined;
  };

  exports.osGeoBoxToNsewObj = function (osGeoBox) {
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
  };

  exports.nsewObjToIdentifier = function (coords) {
    if (coords.north && coords.south && coords.east && coords.west) {
      return ['N:' + coords.north, 'S:' + coords.south, 'E:' + coords.east, 'W:' + coords.west].join(',');
    } else {
      return '';
    }
  };

  exports.osGeoBoxToIdentifier = function (osGeoBox) {
    return exports.nsewObjToIdentifier(exports.osGeoBoxToNsewObj(osGeoBox));
  };

  exports.osGeoBoxFromIdentifier = function (identifier) {
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
  };

  exports.nsewObjFromIdentifier = function (identifier) {
    return exports.osGeoBoxToNsewObj(exports.osGeoBoxFromIdentifier(identifier));
  };

  return exports;
});
