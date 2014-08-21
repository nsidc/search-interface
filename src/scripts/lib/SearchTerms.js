define(['lib/searchTermsTokenizer'], function (tokenizer) {

  // Constructor for a SearchTerms. Param:
  // * terms - an array of search terms
  var SearchTerms = function (terms) {
    if (terms === '' || terms === undefined) {
      terms = [];
    }

    if (terms instanceof Array === false) {
      throw new TypeError('Must construct SearchTerms with an array of terms');
    }

    this.terms = _(terms).clone();
    this.length = terms.length;
  };

  SearchTerms.prototype.count = function () {
    return this.length;
  };

  SearchTerms.prototype.asArray = function () {
    return _(this.terms).clone();
  };

  SearchTerms.prototype.asInputString = function () {
    return _(this.terms).map(
      function (term) {
      return (term.match(/ /) ? '"' + term + '"' : term);
    }).join(' ');
  };

  SearchTerms.prototype.urlEncode = function () {
    return encodeURIComponent(this.asInputString());
  };

  SearchTerms.prototype.formEncode = function () {
    return this.urlEncode().replace(/%20/g, '+');
  };

  // TODO [IT, 2013-05-013]: This has no unit tests
  SearchTerms.fromEncodedString = function (encodedTermsString) {
    var termsString = decodeURIComponent(encodedTermsString.replace(/\+/g, '%20'));
    return SearchTerms.fromInputString(termsString);
  };

  // Creates a new SearchTerms instance from the type of string that a user would enter
  SearchTerms.fromInputString = function (termsString) {
    return new SearchTerms(SearchTerms.tokenizeInputString(termsString));
  };

  SearchTerms.tokenizeInputString = function (termsString) {
    return tokenizer.tokenize(termsString);
  };

  return SearchTerms;
});
