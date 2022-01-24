import Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../templates/attribution.html';

class AttributionView extends Backbone.View {
    render(version) {
        this.$el.html(_.template(viewTemplate)({ version: version }));
        return this;
    }
}

export default AttributionView;
