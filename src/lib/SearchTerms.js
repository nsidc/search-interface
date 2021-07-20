import _ from "underscore";
import SearchTermsTokenizer from "./searchTermsTokenizer";

class SearchTerms {
  /*
   * Constructor for SearchTerms
   *
   * @param {*} inputString: string to tokenize into discrete terms
   */
  constructor(inputString) {
    this.tokenizer = new SearchTermsTokenizer();

    if (inputString === "" || inputString === undefined) {
      this.terms = [];
    } else {
      this.terms = this.tokenizeInputString(inputString);
    }

    if (this.terms instanceof Array === false) {
      throw new TypeError("Must construct SearchTerms with an array of terms");
    }
    this.length = this.terms.length;
  }

  count() {
    return this.length;
  }

  asArray() {
    return _(this.terms).clone();
  }

  asInputString() {
    return _(this.terms)
      .map(function (term) {
        return term.match(/ /) ? '"' + term + '"' : term;
      })
      .join(" ");
  }

  urlEncode() {
    return encodeURIComponent(this.asInputString());
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
