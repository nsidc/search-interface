/* jshint esversion: 6 */

import * as Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../../templates/result_item/temporal_metadata.html';

class TemporalMetadataView extends Backbone.View {
    initialize(options) {
        this.forceRender = options.forceRender;
    }

    render() {
        let ranges = this.model.get('dateRanges');

        ranges = _.filter(ranges, function (range) {
            return range.startDate && moment(range.startDate).isValid();
        }, this);

        if(ranges.length > 0 || this.forceRender) {
            this.$el.html(_.template(viewTemplate)({dateRanges: ranges}));
        }

        return this;
    }
}

export default TemporalMetadataView;
