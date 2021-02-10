/* jshint esversion: 6 */

import Backbone from 'backbone';
import _ from 'underscore';

class FacetModel extends Backbone.Model {

    initialize() {
        const values = this.get('values');
        _.each(values, function (param) {
            param.selected = false;
        });
        this.bindEvents();
    }

    bindEvents() {
        this.mediatorBind('model:toggleFacet', this.toggleSelectedFacet, this);
        this.mediatorBind('model:clearSelectedFacet', this.clearFacetSelected, this);
    }

    clearFacetSelected(facet) {
        if(this.get('id') === facet) {
            var values = this.get('values');
            _.each(values, function (parm) {
                parm.selected = false;
            });
        }
    }

    toggleSelectedFacet(facet, value) {
        if(this.get('id') === facet) {
            var values = this.get('values');
            _.each(values, function (param) {
                if(param.fullName === value) {
                    param.selected = !param.selected;
                }
            });
            this.set({'values': values});
        }
    }

    selected() {
        var selected = false;
        _.each(this.get('values'), function (value) {
            if(value.selected === true) {
                selected = true;
            }
        });
        return selected;
    }
}

export default FacetModel;
