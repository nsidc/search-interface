/* jshint esversion: 6 */

import Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../templates/attribution.html';

class AttributionView extends Backbone.View {
    render() {
        this.$el.html(_.template(viewTemplate)({ version: '123.xyz' }));
        return this;
    }
}

export default AttributionView;
