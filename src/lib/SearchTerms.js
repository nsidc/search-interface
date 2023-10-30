import _ from "underscore";
import SearchTermsTokenizer from "./searchTermsTokenizer";

class SearchTerms {
    /*
   * Constructor for SearchTerms
   *
   * @param {*} terms: array of terms or a string to tokenize into discrete terms
   */
    constructor(terms) {
        this.tokenizer = new SearchTermsTokenizer();

        if (terms instanceof Array) {
            this.terms = [...terms];
        } else {
            if (terms === "" || terms === undefined) {
                this.terms = [];
            } else {
                this.terms = this.tokenizeInputString(terms);
            }
        }

        this.length = this.terms.length;
    }

    count() {
        return this.length;
    }

    asArray() {
        return [...this.terms];
    }

    asInputString() {
        return _(this.terms)
            .map(function (term) {
                return term.match(/ /) ? '"' + term + '"' : term;
            })
            .join(" ");
    }

    urlEncode() {
        let quoted = this.asInputString()
        return encodeURIComponent(quoted);
    }

    formEncode() {
        return this.urlEncode().replace(/%20/g, "+");
    }

    // Creates a new SearchTerms instance from the type of string that a user would enter
    tokenizeInputString(inputStr) {
        return this.tokenizer.tokenize(inputStr);
    }
}

export default SearchTerms;
