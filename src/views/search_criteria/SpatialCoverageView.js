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
            options: this.options,
            el: this.$el.find('#spatial-search-box'),
            model: this.model,
            mediator: this.mediator
        }).render();
        // this.spatialCoverageCompassView = new SpatialCoverageCompassView({
        //     options: this.options,
        //     el: this.$el.find('#compass-container'),
        //     model: this.model,
        //     mediator: this.mediator
        // }).render();

            // this.spatialCoverageView = objectFactory.createInstance('SpatialCoverageTextView', {
            //     el: this.$el.find('#spatial-search-box'),
            //     model: this.model
            // });
            //
            // this.compassView = objectFactory.createInstance('SpatialCoverageCompassView', {
            //     el: this.$el.find('#compass-container'),
            //     model: this.model,
            //     map: this.options.map,
            //     features: this.options.features
            // }).render();

        //this.spatialCoverageView.render(text);

        return this;
    }

    toggleCompassView() {
        this.compassView.toggleVisibility();
        var compassInput = document.getElementById('spatial-options');
        if(compassInput) {
            compassInput.focus();
        }
    }
}

export default SpatialCoverageView;
