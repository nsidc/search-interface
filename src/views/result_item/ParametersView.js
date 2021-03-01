import * as Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../../templates/result_item/parameters.html';

const sectionTemplate = '<% _.each(data, function (p) { %>' +
    ' <div class="parameter pipe-separated-value"><%= p %></div>' +
    '<% }); %>';

class ParametersView extends Backbone.View {
    render() {
        let parameters = (this.model.get('parameters') || '');
        this.$el.html(_.template(viewTemplate)());
        this.$el.find('.parameters-section').append(_.template(sectionTemplate)({data: parameters}));

        return this;
    }
}

export default ParametersView;
