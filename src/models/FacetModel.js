import Backbone from 'backbone';
import _ from 'underscore';

class FacetModel extends Backbone.Model {

    constructor(attributes, options) {
        super(attributes, options);
        const values = this.get('values');
        _.each(values, function (param) {
            param.selected = false;
        });
        this.mediator = this.collection?.mediator;
        this.bindEvents(this.mediator);
    }

    bindEvents() {
        this.mediator?.on('model:toggleFacet', this.toggleSelectedFacet, this);
        this.mediator?.on('model:clearSelectedFacet', this.clearFacetSelected, this);
    }

    clearFacetSelected(facet) {
        if(this.get('id') === facet) {
            let values = this.get('values');
            _.each(values, function (parm) {
                parm.selected = false;
            });
        }
    }

    toggleSelectedFacet(facet, value) {
        this.setSelectedFacet(facet, value)
    }

    setSelectedFacet(facet, value, newValue = 'toggle') {
        if(this.get('id') === facet) {
            let values = this.get('values');
            _.each(values, function (param) {
                if(param.fullName === value) {
                    if (newValue === 'toggle') {
                        param.selected = !param.selected;
                    } else {
                        param.selected = newValue;
                    }
                }
            });
            this.set({'values': values});
        }
    }

    selected() {
        let selected = false;
        _.each(this.get('values'), function (value) {
            if(value.selected === true) {
                selected = true;
            }
        });
        return selected;
    }
}

export default FacetModel;
