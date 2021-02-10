/* jshint esversion: 6 */

import * as Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../../templates/left_column/logo_nsidc.html';

class LogoView extends Backbone.View {

    initialize(options) {
      this.options = options;
    }

    render() {
      this.$el.html(_.template(viewTemplate));
      return this;
    }

    show() {
      this.$el.removeClass('hidden');
    }

    hide() {
      this.$el.addClass('hidden');
    }
}

export default LogoView;
