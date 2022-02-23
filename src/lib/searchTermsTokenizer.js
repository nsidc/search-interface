import _ from "underscore";
import $ from "jquery";
import XRegExp from "xregexp";

class SearchTermsTokenizer {
    tokenize(termsString) {
        let terms = this.tokenizeSearchTermsOrPhrases(termsString);

        // In the case of no matches at all, just bail early
        if (!terms) {
            return "";
        }

        terms = this.splitSearchTermsWithSpecialChars(terms);
        terms = this.trimSearchTerms(terms);

        return terms.length > 0 ? terms : "";
    }

    tokenizeSearchTermsOrPhrases(termsString) {
        let results = [];
        XRegExp.forEach(
            termsString,
            new XRegExp('"[^"]*"|\\S+'),
            function (matches) {
                results.push(matches[0]);
            }
        );
        return results;
    }

    // certain chars in the middle of a word should split the word into two terms
    splitSearchTermsWithSpecialChars(termsArray) {
        return _.reduce(
            termsArray,
            function (memo, term) {
                return _.reduce(
                    term.split(/[+*%&\\|"]/),
                    function (innerMemo, splitTerm) {
                        innerMemo.push(splitTerm);
                        return innerMemo;
                    },
                    memo
                );
            },
            []
        );
    }

    // trim and remove quotes, and leading and trailing special chars
    trimSearchTerms(termsArray) {
        return _.chain(termsArray)
            .map(function (term) {
                return $.trim(term)
                    .replace(/^['/(-]+/, "")
                    .replace(/[-/,:)]+$/, "")
                    .replace(/"/g, "");
            })
            .filter(function (term) {
                return term.length > 1;
            }) // remove terms of just 1 char
            .value();
    }
}

export default SearchTermsTokenizer;
