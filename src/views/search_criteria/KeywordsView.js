import _ from 'underscore';

import Bloodhound from 'corejs-typeahead/dist/bloodhound.min';
import 'corejs-typeahead/dist/typeahead.bundle';

import InputViewBase from '../InputViewBase';
import SearchTerms from '../../lib/SearchTerms';
import viewTemplate from '../../templates/search_criteria/keywords.html';

class KeywordsView extends InputViewBase {
    initialize(options) {
        this.mediator = options.mediator;
        this.bindEvents(this.mediator);
        this.autoSuggestEnabled = options.autoSuggestEnabled;
        this.autoSuggestPath = options.autoSuggestPath;
        this.source = options.source || 'NSIDC';  // TODO: Get this from config
        this.osProvider = options.osProvider;
    }

    bindEvents(mediator) {
        mediator.on('app:home', this.render, this);
        mediator.on('search:initiated', this.closeAutoSuggest, this);
    }

    getSearchTermArrayFromInput() {
        return new SearchTerms(this.getInputField('keyword')).asArray();
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

        // https://github.com/corejavascript/typeahead.js/blob/master/doc/bloodhound.md
        phrases = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('suggestion'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                // TODO: Use the port # ... ?
                url: this.osProvider.openSearchHost + this.autoSuggestPath + this.source, // OpenSearch Suggestion url
                wildcard: '%QUERY',
                filter: this.parseOpenSearchSuggestions
            }
        });

        phrases.clearRemoteCache();

        phrases.initialize();

        // https://github.com/corejavascript/typeahead.js/blob/master/doc/jquery_typeahead.md#options
        this.$el.find('#keyword').typeahead({
            highlight: true,
            hint: false,
            minLength: 1,
        }, {
            name: 'phrases',
            displayKey: 'suggestion',
            source: phrases,
            limit: 10,
            async: true,
        });
    }

    closeAutoSuggest() {
        this.$el.find('#keyword').typeahead('close');
    }

    // param parsedResponse: the parsed JSON response returned by OpenSearch
    // returns: a datum that can be used by Bloodhound and $.typeahead to
    // present suggestions to the user
    parseOpenSearchSuggestions(parsedResponse) {
        let suggestions = parsedResponse[1];

        return _.map(suggestions, (suggestion) => { return { suggestion }});
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
