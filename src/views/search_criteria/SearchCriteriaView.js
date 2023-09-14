import _ from 'underscore';
import InputViewBase from '../InputViewBase';
import GeoBoundingBox from '../../models/GeoBoundingBox';
import KeywordsView from './KeywordsView';
import SpatialCoverageView from './SpatialCoverageView';
import TemporalCoverageView from './TemporalCoverageView';
import * as UtilityFunctions from '../../lib/utility_functions';
import viewTemplate from '../../templates/search_criteria/container.html';

class SearchCriteriaView extends InputViewBase {
    get template() {
        return _.template(viewTemplate);
    }

    get events() {
        return {
            'click button.find-data': 'onFindDataPressed',
            'keypress input.keyboard-active': 'onKeyPressedInInput',
            'click #reset-search': 'onResetSearchClicked'
        };
    }

    initialize(options) {
        this.options = options;
        this.mediator = options.mediator;
        const geoBoundingBox = this.model.get('geoBoundingBox');

        if (!geoBoundingBox) {
            this.geoBoundingBoxModel = new GeoBoundingBox({
                mediator: this.mediator
            });
        } else {
            this.geoBoundingBoxModel = new GeoBoundingBox({
                geoBoundingBox: geoBoundingBox,
                mediator: this.mediator
            });
        }

        this.bindEvents(this.mediator);
    }

    bindEvents(mediator) {
        this.options.collection.on('reset', this.onSearchResultsReset, this);
        mediator.on('search:example', this.onExampleSearch, this);
    }

    onExampleSearch(terms) {
        this.keywordsView.setInputField('keyword', terms);
        this.onFindDataPressed();
    }

    updateBboxModelFromIdentifier(geoBboxIdentifier) {
        this.geoBoundingBoxModel.setFromIdentifier(geoBboxIdentifier);
    }

    onFindDataPressed() {
        let criteriaHash;

        if(this.temporalCoverageView.isValid()) {
            criteriaHash = {
                startDate: this.getInputField('start-date'),
                endDate: this.getInputField('end-date'),
                osGeoBbox: this.getGeoBbox(),
                itemsPerPage: this.model.get('itemsPerPage'),
                sortKeys: this.model.get('sortKeys'),
                // setCriteria() first resets all the criteria, so save the items per page
                // and sort keys for use in the next search.
            };
            _.extend(criteriaHash, this.keywordsView.getKeywords());

            this.model.setCriteria(criteriaHash);
            this.model.resetFacetFilters();
            this.mediator.trigger('search:initiated', this.model);
        }
    }

    getGeoBbox() {
        let geoBoundingBoxIdentifier, coords;

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
    }

    onSearchClearParams() {
        this.setInputField('keyword', '');
        this.setInputField('start-date', '');
        this.setInputField('end-date', '');
        this.setInputField('spatial-options', '');
    }

    onSearchResultsReset() {
        this.keywordsView.setSearchTermField(this.options.collection);
        this.temporalCoverageView.render(
            this.options.collection.getStartDate(),
            this.options.collection.getEndDate()
        );
        this.spatialCoverageView.render(this.options.collection.getOsGeoBbox().split(',').join(', '));
    }

    onKeyPressedInInput(event) {
        if (event.which === 13) {  // if Enter is the pressed key
            this.onFindDataPressed();
        }
    }

    onResetSearchClicked() {
        if (this.options.config.searchCriteriaView.reset === 'home') {
            this.mediator.trigger('app:home');
        }
    }

    toggleVisibility(element) {
        element.toggleClass('hidden');
    }

    render() {
        this.$el.html(this.template({
            searchButtonText: this.options.config.searchCriteriaView.searchButtonText
        }));
        this.keywordsView = new KeywordsView({
            el: this.$el.find('#keywords-container'),
            mediator: this.mediator,
            autoSuggestEnabled: this.options.config.features.autoSuggestEnabled,
            autoSuggestPath: this.options.config.features.autoSuggestPath,
            osProvider: this.options.osProvider,
        }).render();

        this.spatialCoverageView = new SpatialCoverageView({
            el: this.$el.find('#spatial-container'),
            mediator: this.mediator,
            model: this.geoBoundingBoxModel,
            map: this.options.map,
            config: this.options.config.spatialCoverageView,
        }).render();

        this.temporalCoverageView = new TemporalCoverageView({
            el: this.$el.find('#temporal-container'),
            mediator: this.mediator,
            model: this.model,
            config: this.options.config.temporalCoverageView
        }).render();

        if (this.options.reset !== 'off') {
            this.$el.find('#reset-search').css('display', 'initial');
        }

        return this;
    }

    show() {
        this.$el.removeClass('hidden');
    }
}

export default SearchCriteriaView;
