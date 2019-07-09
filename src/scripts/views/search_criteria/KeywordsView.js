define(
  ['lib/SearchTerms',
   'views/InputViewBase',
   'lib/mediator_mixin',
   'text!templates/search_criteria/keywords.html'],
  function (SearchTerms, InputViewBase, mediatorMixin, keywordsTemplate) {
    var KeywordsView;

    KeywordsView = InputViewBase.extend({
      initialize: function (options) {
        this.bindEvents();
        this.autoSuggestEnabled = options.autoSuggestEnabled;
        this.source = options.source;
      },

      bindEvents: function () {
        this.mediatorBind('app:home', this.render, this);
        this.mediatorBind('search:initiated', this.closeAutoSuggest, this);
      },

      getSearchTermArrayFromInput: function () {
        return new SearchTerms.fromInputString(this.getInputField('keyword')).asArray();
      },

      getKeywords: function () {
        return {keyword: this.getSearchTermArrayFromInput()};
      },

      setSearchTermField: function (resultsCollection) {
        this.setInputField('keyword', this.searchTermsAsString(resultsCollection.getKeyword()));
      },

      searchTermsAsString: function (searchTerms) {
        var searchTermString = '';

        if (typeof searchTerms === 'string') {
          searchTermString = searchTerms;
        } else {
          _.each(searchTerms, function (term, index) {
            if (index > 0) {
              searchTermString += ' ';
            }
            if (term.indexOf(' ') > -1) {
              searchTermString += '"' + term + '"';
            } else {
              searchTermString += term;
            }
          });
        }

        return searchTermString;
      },

      // depends on the element 'input#keyword' being present
      setupAutoSuggest: function () {
        var phrases;

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
      },

      closeAutoSuggest: function () {
        this.$el.find('#keyword').typeahead('close');
      },

      // param parsedResponse: the parsed JSON response returned by OpenSearch
      // returns: a datum that can be used by Bloodhound and $.typeahead to
      // present suggestions to the user
      parseOpenSearchSuggestions: function (parsedResponse) {
        // var prefix = parsedResponse[0];
        var suggestions = parsedResponse[1];
        // var descriptions = parsedResponse[2];
        // var queryUrls = parsedResponse[3];

        return _.map(suggestions, function (suggestion) {
          return { suggestion: suggestion };
        });
      },

      render: function () {
        this.$el.html(_.template(keywordsTemplate)());

        if (this.autoSuggestEnabled) {
          this.setupAutoSuggest();
        }

        return this;
      }
    });

    _.extend(KeywordsView.prototype, mediatorMixin);

    return KeywordsView;
  }
);
