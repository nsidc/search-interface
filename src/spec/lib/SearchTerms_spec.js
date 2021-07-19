define(['lib/SearchTerms'], function (SearchTerms) {

  describe('SearchTerms', function () {

    it('is constructed from an array of terms', function () {
      var searchTerms = new SearchTerms(['one', 'two', 'three']);
      expect(searchTerms.length).toEqual(3);
    });

    it('doesn\'t hold on to references to the constructing array', function () {
      var arr = ['one', 'two'],
          searchTerms = new SearchTerms(arr);

      arr[0] = 'something else';

      expect(searchTerms.asArray()).toEqual(['one', 'two']);
    });

    it('doesn\'t leak mutable references to its internal data', function () {
      var arr = ['one', 'two'],
          searchTerms = new SearchTerms(arr),
          returnVal = searchTerms.asArray();

      returnVal[0] = 'something else';

      expect(searchTerms.asArray()).toEqual(['one', 'two']);
    });

    it('requires an array of terms in the ctor call', function () {
      expect(function () {
        new SearchTerms('blah');
      }).toThrow();
    });

    it('allows empty strings in the ctor call', function () {
      expect(new SearchTerms('').asArray()).toEqual([]);
    });

    describe('representing search terms in other formats', function () {
      it('exports a string formatted for input fields', function () {
        expect(new SearchTerms(['one', 'two']).asInputString()).toEqual('one two');
        expect(new SearchTerms(['a phrase', 'two']).asInputString()).toEqual('"a phrase" two');
      });

      it('represents the search terms as a URL-encoded string', function () {
        expect(new SearchTerms(['one', 'two']).urlEncode()).toEqual('one%20two');
        expect(new SearchTerms(['a phrase', 'two']).urlEncode()).toEqual('%22a%20phrase%22%20two');
      });

      it('represents the search terms as a form-encoded string', function () {
        expect(new SearchTerms(['one', 'two']).formEncode()).toEqual('one+two');
        expect(new SearchTerms(['a phrase', 'two']).formEncode()).toEqual('%22a+phrase%22+two');
      });
    });
  });
});
