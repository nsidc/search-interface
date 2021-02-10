/* jshint esversion: 6 */

import * as Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../../templates/result_item/data_format.html';

const sectionTemplate = '<% _.each(data, function (df) { %>' +
        '<div class="data-format pipe-separated-value"><%= df %></div>' +
        '<% }); %>';

class DataFormatView extends Backbone.View {
    render() {
        let dataFormats = (this.model.get('dataFormats') || '');
        this.$el.html(_.template(viewTemplate)());
        this.$el.find('.data-format-section').append(_.template(sectionTemplate)({data: dataFormats}));

        return this;
    }
}

export default DataFormatView;
