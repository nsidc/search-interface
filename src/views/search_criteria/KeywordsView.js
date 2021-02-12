/* jshint esversion: 6 */

import _ from 'underscore';
import InputViewBase from '../InputViewBase';
import SearchTerms from '../../lib/SearchTerms';
import viewTemplate from '../../templates/search_criteria/keywords.html';

class KeywordsView extends InputViewBase {
    initialize(options) {
        this.mediator = options.mediator;
        this.bindEvents(this.mediator);
        this.autoSuggestEnabled = options.autoSuggestEnabled;
        this.source = options.source;
    }

    bindEvents(mediator) {
        mediator.on('app:home', this.render, this);
        mediator.on('search:initiated', this.closeAutoSuggest, this);
    }

    getSearchTermArrayFromInput() {
        return new SearchTerms(this.getInputField('keyword')).tokenizeInputString().asArray();
    }

    getKeywords() {
        return {keyword: this.getSearchTermArrayFromInput()};
    }

    setSearchTermField(resultsCollection) {
        this.setInputField('keyword', this.searchTermsAsString(resultsCollection.getKeyword()));
    }

    searchTermsAsString(searchTerms) {
        let searchTermString = '';

        if(typeof searchTerms === 'string') {
            searchTermString = searchTerms;
        }
        else {
            _.each(searchTerms, function (term, index) {
                if(index > 0) {
                    searchTermString += ' ';
                }
                if(term.indexOf(' ') > -1) {
                    searchTermString += '"' + term + '"';
                }
                else {
                    searchTermString += term;
                }
            });
        }

        return searchTermString;
    }

    // depends on the element 'input#keyword' being present
    setupAutoSuggest() {
        let phrases;

        // http://twitter.github.io/typeahead.js/examples/#bloodhound
        // https://github.com/twitter/typeahead.js/blob/master/doc/bloodhound.md#options
        phrases = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('suggestion'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            limit: 10,
            remote: {
                url: '/api/dataset/2/suggest?q=%QUERY&source=' + this.source, // OpenSearch Suggestion url
                filter: this.parseOpenSearchSuggestions
            }
        });

        phrases.clearRemoteCache();

        phrases.initialize();

        // https://github.com/twitter/typeahead.js/blob/master/doc/jquery_typeahead.md#options
        this.$el.find('#keyword').typeahead({
            highlight: true,
            hint: false,
            minLength: 1
        }, {
            name: 'phrases',
            displayKey: 'suggestion',
            source: phrases.ttAdapter()
        });
    }

    closeAutoSuggest() {
        this.$el.find('#keyword').typeahead('close');
    }

    // param parsedResponse: the parsed JSON response returned by OpenSearch
    // returns: a datum that can be used by Bloodhound and $.typeahead to
    // present suggestions to the user
    parseOpenSearchSuggestions(parsedResponse) {
        // var prefix = parsedResponse[0];
        let suggestions = parsedResponse[1];
        // var descriptions = parsedResponse[2];
        // var queryUrls = parsedResponse[3];

        return _.map(suggestions, function (suggestion) {
            return {suggestion: suggestion};
        });
    }

    render() {
        this.$el.html(_.template(viewTemplate)());

        if(this.autoSuggestEnabled) {
            this.setupAutoSuggest();
        }

        return this;
    }
}

export default KeywordsView;
