//test harness for utilityFunctions

define(['lib/utility_functions'], function (utilityFunctions) {

  describe('Utility Functions', function () {
    it('capitalizes the first letter of a string', function () {
      var propertyName = 'someProperty';
      expect(utilityFunctions.toInitialCaps(propertyName)).toEqual('SomeProperty');
    });

    it('converts a string to an integer', function () {
      var numberString = '900';
      expect(utilityFunctions.toNumber(numberString, 'int', 'Exception message')).toEqual(900);
    });

    it('converts a string to a float', function () {
      var numberString = '900.234';
      expect(utilityFunctions.toNumber(numberString, 'float', 'Exception message')).toEqual(900.234);
    });

    it('throws an error if a non-digit string is passed in', function () {
      var numberString = 'non-digit',
      caughtError;

      try {
        utilityFunctions.toNumber(numberString, 'float', 'Error message');
      } catch (error) {
        caughtError = error;
      }
      expect(caughtError).not.toBe(undefined);
      expect(caughtError.message).toBe('Error message');
    });


    it('removes html tags', function () {
      var withTags = '<p>hello world</p>';
      expect(utilityFunctions.removeTags(withTags)).toEqual('hello world');
    });

    it('removes extra spaces', function () {
      var badString = 'hello  world   ';
      expect(utilityFunctions.removeWhitespace(badString)).toEqual('hello world');
    });

    it('gets an array containing the text from a jQuery array', function () {
      var html = '<div class="test">first text</div><div class="test">second text</div>';

      expect(utilityFunctions.getArrayFromjQueryArrayTextContents($(html))).toEqual(['first text', 'second text']);
    });

    it('Should escape &#<>()\'" characters', function () {
      var taggedString = '<a>("I\'m" #1 & 2)</a>',
      escapedString = '&lt;a&gt;&#40;&quot;I&#39;m&quot; &#35;1 &amp; 2&#41;&lt;/a&gt;',
      renderedString;

      renderedString = utilityFunctions.escapeTags(taggedString);

      expect(renderedString).toBe(escapedString);
    });

    describe('float validation', function () {

      beforeEach(function () {

        this.addMatchers({
          toBeValidFloat: function () {
            var notText = this.isNot ? ' not' : '',
            number = this.actual;

            this.message = function () {
              return 'Expected ' + number + notText + ' to be a valid float';
            };

            return utilityFunctions.isFloat(number);
          }

        });

      });

      it('accepts valid numbers', function () {
        expect('-180.0').toBeValidFloat();
        expect('2').toBeValidFloat();
        expect('2893.28938912').toBeValidFloat();
      });

      it('rejects strings that are not valid numbers', function () {
        // JSHint does not like symbols so instead using unicode to generate the degree symbol
        var unicodeDegreeSymbol = '\u00B0';
        expect('38' + unicodeDegreeSymbol + '53\'23"N').not.toBeValidFloat();
        expect('90f').not.toBeValidFloat();
        expect('--90').not.toBeValidFloat();
      });

    });

    describe('geo bounding box string conversion', function () {
      it('converts an osGeoBox to an identifer', function () {
        expect(utilityFunctions.osGeoBoxToIdentifier('-180,45,180,90')).toBe('N:90,S:45,E:180,W:-180');
      });

      it('converts a bounding box URL identifier to an osGeoBox', function () {
        expect(utilityFunctions.osGeoBoxFromIdentifier('N:90,S:45,E:180,W:-180')).toBe('-180,45,180,90');
      });

      it('converts a bounding box URL identifier with spaces to an osGeoBox', function () {
        expect(utilityFunctions.osGeoBoxFromIdentifier('N:90, S:45, E:180, W:-180')).toBe('-180,45,180,90');
      });

      it('handles empty bounding box URL identifier strings', function () {
        expect(utilityFunctions.osGeoBoxFromIdentifier('')).toBe('');
      });

    });


  });
});
