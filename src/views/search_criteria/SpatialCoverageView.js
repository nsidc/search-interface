import * as Backbone from 'backbone';
import _ from 'underscore';
import SpatialCoverageCompassView from './SpatialCoverageCompassView';
import SpatialCoverageTextView from './SpatialCoverageTextView';
import viewTemplate from '../../templates/search_criteria/spatial_search.html';

class SpatialCoverageView extends Backbone.View {

    get events() {
        return {
            //'click #spatial-search-box': 'toggleCompassView'
        };
    }

    initialize(options) {
        this.options = options;
        this.mediator = options.mediator;
    }

    render() {
        this.$el.html(_.template(viewTemplate)());
        this.spatialCoverageTextView = new SpatialCoverageTextView({
            config: this.options.config,
            el: this.$el.find('#spatial-search-box'),
            model: this.model,
            mediator: this.mediator
        }).render();

        this.spatialCoverageCompassView = new SpatialCoverageCompassView({
            config: this.options.config,
            el: this.$el.find('#compass-container'),
            model: this.model,
            mediator: this.mediator,
            // map: this.options.map,
        }).render();

        return this;
    }

    toggleCompassView() {
        this.spatialCoverageCompassView.toggleVisibility();
        const compassInput = document.getElementById('spatial-options');
        if(compassInput) {
            compassInput.focus();
        }
    }
}

export default SpatialCoverageView;
