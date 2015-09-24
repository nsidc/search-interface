define(
 ['lib/mediator_mixin',
  'lib/objectFactory',
  'models/GeoBoundingBox',
  'views/InputViewBase',
  'vendor/requirejs/text!templates/search_criteria/container.html',
  'lib/utility_functions'],
  function (mediatorMixin,
            objectFactory,
            GeoBoundingBox,
            InputViewBase,
            containerTemplate,
            UtilityFunctions) {
    var SearchCriteriaView,
      templates,
      geoBoundingBoxModel;

    templates = {
      container: _.template(containerTemplate)
    };

    SearchCriteriaView = InputViewBase.extend({

      events: {
        'click button.find-data' : 'onFindDataPressed',
        'keypress input.keyboard-active' : 'onKeyPressedInInput',
        'click #reset-search': 'onResetSearchClicked'
      },

      initialize: function (options) {
        this.options = options;
        var geoBoundingBox = this.model.get('geoBoundingBox');

        if (!geoBoundingBox) {
          geoBoundingBoxModel = new GeoBoundingBox();
        } else {
          geoBoundingBoxModel = new GeoBoundingBox(geoBoundingBox);
        }

        this.bindEvents();

        //_.bindAll(this);
      },

      bindEvents: function () {
        this.options.searchResultsCollection.on('reset', this.onSearchResultsReset, this);
        this.mediatorBind('search:clearParams', this.onSearchClearParams, this);
        this.mediatorBind('search:example', this.onExampleSearch, this);
      },

      onExampleSearch: function (terms) {
        this.keywordsView.setInputField('keyword', terms);
        this.onFindDataPressed();
      },

      updateBboxModelFromIdentifier: function (geoBboxIdentifier) {
        geoBoundingBoxModel.setFromIdentifier(geoBboxIdentifier);
      },

      onFindDataPressed: function () {
        var criteriaHash;

        if (this.temporalCoverageView.isValid()) {
          criteriaHash = {
            startDate: this.getInputField('start-date'),
            endDate: this.getInputField('end-date'),
            osGeoBbox: this.getGeoBbox(),
            itemsPerPage: this.model.get('itemsPerPage')
            // setCriteria() first resets all the criteria, so save the items per page
            // so that it is unchanged when we start a new search via the Find Data button
          };
          _.extend(criteriaHash, this.keywordsView.getKeywords());

          this.model.setCriteria(criteriaHash);
          this.model.resetFacetFilters();
          this.mediatorTrigger('search:initiated', this.model);
        }
      },

      getGeoBbox: function () {
        var geoBoundingBoxIdentifier, coords;

        coords = {
          north: this.getInputField('spatial-options-north'),
          south: this.getInputField('spatial-options-south'),
          east: this.getInputField('spatial-options-east'),
          west: this.getInputField('spatial-options-west')
        };

        if (coords.north) {
          geoBoundingBoxIdentifier = UtilityFunctions.nsewObjToIdentifier(coords);
        } else {
          geoBoundingBoxIdentifier = this.getInputField('spatial-options');
        }

        this.updateBboxModelFromIdentifier(geoBoundingBoxIdentifier || '');

        return geoBoundingBoxIdentifier;
      },

      onSearchClearParams: function () {
        this.setInputField('keyword', '');
        this.setInputField('start-date', '');
        this.setInputField('end-date', '');
        this.setInputField('spatial-options', '');
      },

      onSearchResultsReset: function () {
        this.keywordsView.setSearchTermField(this.options.searchResultsCollection);
        this.temporalCoverageView.render(
          this.options.searchResultsCollection.getStartDate(),
          this.options.searchResultsCollection.getEndDate()
        );
        this.spatialCoverageView.render(this.options.searchResultsCollection.getOsGeoBbox().split(',').join(', '));
      },

      onKeyPressedInInput: function (event) {
        if (event.which === 13) {  // if Enter is the pressed key
          this.onFindDataPressed();
        }
      },

      onResetSearchClicked: function () {
        if (this.options.reset === 'home') {
          this.mediatorTrigger('app:home');
        }

        if (this.options.reset === 'clear') {
          this.mediatorTrigger('search:resetClear');
          this.onSearchClearParams();
        }
      },

      toggleVisibility: function (element) {
        element.toggleClass('hidden');
      },

      render: function () {
        this.$el.html(templates.container({searchButtonText: this.options.searchButtonText}));

        this.keywordsView = objectFactory.createInstance('KeywordsView', {
          el: this.$el.find('#keywords-container')
        }).render();

        this.spatialCoverageView =  objectFactory.createInstance('SpatialCoverageView', {
          el: this.$el.find('#spatial-container'),
          model: geoBoundingBoxModel,
          map: this.options.map,
          features: this.options.features
        }).render();

        this.temporalCoverageView = objectFactory.createInstance('TemporalCoverageView', {
          el: this.$el.find('#temporal-container'),
          model: this.model
        }).render();

        if (this.options.reset !== 'off') {
          this.$el.find('#reset-search').css('display', 'initial');
        }

        return this;
      },

      show: function () {
        this.$el.removeClass('hidden');
      }
    });

    // Mix in the mediator behaviour
    _.extend(SearchCriteriaView.prototype, mediatorMixin);

    // Expose the constructor to the world via the namespace object
    return SearchCriteriaView;
  }
);
