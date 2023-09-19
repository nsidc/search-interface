import Backbone from 'backbone';
import _ from 'underscore';
import { isDate, parse } from 'date-fns';
import viewTemplate from '../../templates/result_item/temporal_metadata.html';


class TemporalMetadataView extends Backbone.View {
    initialize(options) {
        this.forceRender = options.forceRender;
    }

    render() {
        let ranges = this.filterRanges(this.model.get('dateRanges'));

        if(ranges.length > 0 || this.forceRender) {
            this.$el.html(_.template(viewTemplate)({dateRanges: ranges}));
        }

        return this;
    }

    filterRanges(dateRanges) {
        let ranges = _.filter(dateRanges, function (range) {
            return range.startDate && isDate(parse(range.startDate, 'yyyy-MM-dd', new Date()));
        }, this);

        return _.map(ranges, function (range) {
            if (range.endDate === undefined || range.endDate === '') {
                range.endDate = 'present';
            }
            return range;
        });
    }
}

export default TemporalMetadataView;
