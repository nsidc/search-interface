import * as Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../../templates/search_criteria/spatial_coverage_text.html';

// SpatialCoverageTextView - Backbone view to display the
// spatial coverage in a human readable (string) form
// define(['text!templates/search_criteria/nsidc_text.html', 'lib/mediator_mixin'],
//        function (textTemplate, mediatorMixin) {
//
//   var template, NsidcSpatialCoverageTextView;
//
//   template = _.template(textTemplate);
//
//   // expose a constructor
class SpatialCoverageTextView extends Backbone.View {

    get events() {
        return {
            'change #spatial-options': 'updateModelFromInputVal'
        };
    }

    initialize(options) {
        this.options = options;
        this.mediator = options.mediator;
        this.model.on('change', this.onModelChange, this);
        this.mediator.on('search:resetBoundingBox', this.reset, this);
        this.mediator.on('app:home', this.reset, this);
    }

    onModelChange() {
        this.render();
    }

    render(text) {
        var presetText = this.options.config.spatialText;
        this.$el.html(_.template(viewTemplate)({presetText: presetText, identifierView: ''}));

        // If the model is set to the defaults and we are trying to set the default identifier, override the text value.
        // Otherwise, leave the text alone.
        // TODO: Keep in sync with results collection rather than passing in text to render
        if (this.model.isSetToDefaults() && (this.model.asIdentifier() === text || text === undefined)) {
          text = '';
        }

        if (text === undefined) {
          text = this.model.asIdentifier();
        }

        this.$el.html(_.template(viewTemplate)({ identifierView: text, presetText: presetText}));
        return this;
    }

    updateModelFromInputVal() {
        var bboxIdentifier = this.$el.find('#spatial-options').val();
        this.model.setFromIdentifier(bboxIdentifier);
    }

    reset() {
        this.model.resetCriteria();
        this.render();
    }
}

export default SpatialCoverageTextView;
