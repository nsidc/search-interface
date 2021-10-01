import * as UtilityFunctions from '../../lib/utility_functions';
import $ from 'jquery';

describe('UtilityFunctions', function () {
  describe('.osGeoBoxToNsewObj', function () {
    it('returns the empty string when passed undefined', function () {
      expect(UtilityFunctions.osGeoBoxToNsewObj(undefined)).toEqual('');
    });

    it('returns the empty string when passed the empty string', function () {
      expect(UtilityFunctions.osGeoBoxToNsewObj('')).toEqual('');
    });

    it('returns an object with coordinates matching the passed west, south, east, and north values', function () {
      expect(UtilityFunctions.osGeoBoxToNsewObj('-180,45,180,90')).toEqual({
        north: '90',
        south: '45',
        east: '180',
        west: '-180'
      });
    });
  });

  describe('.osGeoBoxToIdentifier', function () {
    it('returns a string formatted for a URL with coordinates matching the passed west, south, east, and north values', function () {
      expect(UtilityFunctions.osGeoBoxToIdentifier('-180,45,180,90')).toEqual('N:90,S:45,E:180,W:-180');
    });

    it('converts an osGeoBox to an identifer', function () {
      expect(UtilityFunctions.osGeoBoxToIdentifier('-180,45,180,90')).toBe('N:90,S:45,E:180,W:-180');
    });
  });

  describe('.nsewObjToIdentifier', function () {
    it('returns a string formatted for a URL with coordinates matching the passed west, south, east, and north values', function () {
      expect(UtilityFunctions.nsewObjToIdentifier({
        north: 90,
        south: 45,
        east: 180,
        west: -180
      })).toEqual('N:90,S:45,E:180,W:-180');
    });
  });

  describe('.osGeoBoxFromIdentifier', function () {
    it('converts a bounding box URL identifier to an osGeoBox', function () {
      expect(UtilityFunctions.osGeoBoxFromIdentifier('N:90,S:45,E:180,W:-180')).toBe('-180,45,180,90');
    });

    it('converts a bounding box URL identifier with spaces to an osGeoBox', function () {
      expect(UtilityFunctions.osGeoBoxFromIdentifier('N:90, S:45, E:180, W:-180')).toBe('-180,45,180,90');
    });

    it('handles empty bounding box URL identifier strings', function () {
      expect(UtilityFunctions.osGeoBoxFromIdentifier('')).toBe('');
    });
  });

  it('capitalizes the first letter of a string', function () {
    var propertyName = 'someProperty';
    expect(UtilityFunctions.toInitialCaps(propertyName)).toEqual('SomeProperty');
  });

  it('converts a string to an integer', function () {
    var numberString = '900';
    expect(UtilityFunctions.toNumber(numberString, 'int', 'Exception message')).toEqual(900);
  });

  it('converts a string to a float', function () {
    var numberString = '900.234';
    expect(UtilityFunctions.toNumber(numberString, 'float', 'Exception message')).toEqual(900.234);
  });

  it('throws an error if a non-digit string is passed in', function () {
    var numberString = 'non-digit',
    caughtError;

    try {
      UtilityFunctions.toNumber(numberString, 'float', 'Error message');
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError).not.toBe(undefined);
    expect(caughtError.message).toBe('Error message');
  });


  it('removes html tags', function () {
    var withTags = '<p>hello world</p>';
    expect(UtilityFunctions.removeTags(withTags)).toEqual('hello world');
  });

  it('removes extra spaces', function () {
    var badString = 'hello  world   ';
    expect(UtilityFunctions.removeWhitespace(badString)).toEqual('hello world');
  });

  it('gets an array containing the text from a jQuery array', function () {
    var html = $.parseHTML('<div class="test">first text</div><div class="test">second text</div>');

    expect(UtilityFunctions.getArrayFromjQueryArrayTextContents(html)).toEqual(['first text', 'second text']);
  });

  it('Should escape &#<>()\'" characters', function () {
    var taggedString = '<a>("I\'m" #1 & 2)</a>',
    escapedString = '&lt;a&gt;&#40;&quot;I&#39;m&quot; &#35;1 &amp; 2&#41;&lt;/a&gt;',
    renderedString;

    renderedString = UtilityFunctions.escapeTags(taggedString);

    expect(renderedString).toBe(escapedString);
  });

  describe('float validation', function () {
    it('accepts valid numbers', function () {
      expect(UtilityFunctions.isFloat('-180.0')).toBeTruthy();
      expect(UtilityFunctions.isFloat('2')).toBeTruthy();
      expect(UtilityFunctions.isFloat('2893.28938912')).toBeTruthy()
    });

    it('rejects strings that are not valid numbers', function () {
      // JSHint does not like symbols so instead using unicode to generate the degree symbol
      var unicodeDegreeSymbol = '\u00B0';
      expect(UtilityFunctions.isFloat('38' + unicodeDegreeSymbol + '53\'23"N')).toBeFalsy();
      expect(UtilityFunctions.isFloat('90f')).toBeFalsy();
      expect(UtilityFunctions.isFloat('--90')).toBeFalsy();
    });
  });
});
