/* jshint esversion: 6 */

import * as Backbone from 'backbone';
import _ from 'underscore';
import FacetView from './FacetView';
import viewTemplate from '../../templates/left_column/facet.html';

class FacetsView extends Backbone.View {

    get events() {
        return {
            'click .facetExpand': 'expand',
            'click .facetCollapse': 'collapse'
        };
    }

    initialize(options) {
        this.options = options;
    }

    collapse(event) {
        var id = event.target.id,
            shownFacets = this.options.itemsPerFacet - 1;

        this.$('ul#' + id).children(':gt(' + shownFacets + ')').addClass('hidden');
        this.$('a#' + id + '.facetExpand').removeClass('hidden');
        this.$('a#' + id + '.facetCollapse').addClass('hidden');

        scrollTo(0, ($('#' + id).offset().top) - 50);
    }

    expand(event) {
        const id = event.target.id;
        this.$('ul#' + id).children().removeClass('hidden');
        this.$('a#' + id + '.facetExpand').addClass('hidden');
        this.$('a#' + id + '.facetCollapse').removeClass('hidden');
    }

    render() {
        this.options.facetsCollection.each(function (facet, index) {
            this.$el.append(_.template(viewTemplate))({id: facet.id});

            if(this.options.searchParamsModel.get('facetFilters')) {
                const facetFilters = this.options.searchParamsModel.get('facetFilters')[facet.id] || [];

                new FacetView({
                    el: this.$('.facet').eq(index),
                    model: facet,
                    selectedFacets: facetFilters
                }).render();
            }
        }, this);

        return this;
    }
}

export default FacetsView;
