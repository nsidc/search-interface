define([], function () {
  var tokenizer = {};

  tokenizer.tokenize = function (termsString) {
    var terms = tokenizer.tokenizeSearchTermsOrPhrases(termsString);

    // In the case of no matches at all, just bail early
    if (!terms) {
      return '';
    }

    terms = tokenizer.splitSearchTermsWithSpecialChars(terms);
    terms = tokenizer.trimSearchTerms(terms);

    return terms.length > 0 ? terms : '';
  };

  tokenizer.tokenizeSearchTermsOrPhrases = function (termsString) {
    return XRegExp.forEach(
      termsString,
      new XRegExp('"[^"]*"|\\S+'),
      function (matches) {
        this.push(matches[0]);
      },
      [] // this empty array is bound to the `this` within the callback function.  Poor man's reduce, shall we say.
    );
  };

  // certain chars in the middle of a word should split the word into two terms
  tokenizer.splitSearchTermsWithSpecialChars = function (termsArray) {
    return _.reduce(
      termsArray,
      function (memo, term) {
        return _.reduce(
          term.split(/[+*%&\\|"]/),
          function (innerMemo, splitTerm) {
            innerMemo.push(splitTerm);
            return innerMemo;
          }, memo);
      }, []);
  };

  // trim and remove quotes, and leading and trailing special chars
  tokenizer.trimSearchTerms = function (termsArray) {
    return _.chain(termsArray)
      .map(function (term) {
        return $.trim(term)
        .replace(/^['/(-]+/, '')
        .replace(/[-/,:)]+$/, '')
        .replace(/"/g, '');
      })
      .filter(function (term) { return term.length > 1; })            // remove terms of just 1 char
      .value();
  };

  return tokenizer;
});
