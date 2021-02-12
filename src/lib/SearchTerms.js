/* jshint esversion: 6 */

import SearchTermsTokenizer from './searchTermsTokenizer';

class SearchTerms {
    // Constructor for a SearchTerms. Param:
    // * terms - an array of search terms
    constructor(terms) {
        this.tokenizer = new SearchTermsTokenizer();

        if(terms === '' || terms === undefined) {
            terms = [];
        }

        if(terms instanceof Array === false) {
            throw new TypeError('Must construct SearchTerms with an array of terms');
        }

        this.terms = _(terms).clone();
        this.length = terms.length;
    }

    count() {
        return this.length;
    }

    asArray() {
        return _(this.terms).clone();
    }

    asInputString() {
        return _(this.terms).map(
            function (term) {
                return (term.match(/ /) ? '"' + term + '"' : term);
            }).join(' ');
    }

    urlEncode() {
        return encodeURIComponent(this.asInputString());
    }

    formEncode() {
        return this.urlEncode().replace(/%20/g, '+');
    }

    // Creates a new SearchTerms instance from the type of string that a user would enter
    tokenizeInputString() {
        return this.tokenizer.tokenize(this.terms);
    }

    fromInputString() {
        return this.tokenizeInputString(this.terms);
    }
}

// TODO [IT, 2013-05-013]: This has no unit tests
export function fromEncodedString(encodedTermsString) {
    let termsString = decodeURIComponent(encodedTermsString.replace(/\+/g, '%20'));
    return new SearchTerms(termsString).fromInputString();
}

export default SearchTerms;
