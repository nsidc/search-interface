import * as Backbone from 'backbone';
import _ from 'underscore';
import $ from 'jquery';
import viewTemplate from '../../templates/left_column/clear-facet-link.html';

class ClearFacetLinkView extends Backbone.View {
    get events() {
        return {
            'click .facet_clear_link': 'clearFacet',
            'keyup .facet-filter': 'onTypedInput'
        };
    }

    initialize(options) {
        this.facet = this.$el.find('ul').attr('id');
        this.element = this.$el;
        this.template = _.template(viewTemplate)({id: this.facet + '_clear_button'});
        this.mediator = options.mediator;
        this.mediator.on('facet:clearLinkTrigger', this.toggle, this);
    }

    clearFacet() {
        _.each(this.$el.find(':input[type=checkbox]'), function (input) {
            $(input).attr('checked', false);
        });
        this.mediator.trigger('model:clearFacet', this.facet);
        this.mediator.trigger('model:clearSelectedFacet', this.facet);
        this.mediator.trigger('facet:sort');
        this.toggle();
    }

    render() {
        this.$('h3').append(this.template);
        this.toggle();
        return this;
    }

    toggle() {
        let el = $(this.element).find('.facet_clear_link');

        if(this.model.selected()) {
            el.show();
        }
        else {
            el.hide();
        }
    }

    onTypedInput(ev) {
        let el = $(this.element).find('.facet_clear_link');

        if($(ev.target).val() !== '') {
            el.show();
        }
        else {
            this.toggle();
        }
    }

}

export default ClearFacetLinkView;
