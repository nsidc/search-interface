import * as Backbone from 'backbone';
import _ from 'underscore';
import { isDate } from 'date-fns';
import viewTemplate from '../../templates/result_item/temporal_metadata.html';

class TemporalMetadataView extends Backbone.View {
    initialize(options) {
        this.forceRender = options.forceRender;
    }

    render() {
        let ranges = this.model.get('dateRanges');

        ranges = _.filter(ranges, function (range) {
            return range.startDate && isDate(range.startDate);
        }, this);

        if(ranges.length > 0 || this.forceRender) {
            this.$el.html(_.template(viewTemplate)({dateRanges: ranges}));
        }

        return this;
    }
}

export default TemporalMetadataView;
