/* jshint esversion: 6 */

import * as Backbone from 'backbone';
import _ from 'underscore';
import ClearFacetLinkView from './ClearFacetLinkView';
import dividerTemplate from '../../templates/li-divider.html';
import filterTemplate from '../../templates/left_column/facet-filter-input.html';
import headerTemplate from '../../templates/left_column/facet-header.html';
import valueTemplate from '../../templates/left_column/facet-value.html';

class FacetView extends Backbone.View {
    get events() {
        return {
            'click li input': 'toggleFacet',
            'keyup .facet-filter': 'filterVisibleFacets',
            'click .facet_clear_link': 'clearFilterInput'
        };
    }

    initialize(options) {
        this.readOptions(options);
        this.bindEvents();

        this.templates = {
            divider: _.template(dividerTemplate),
            filter: _.template(filterTemplate),
            header: _.template(headerTemplate),
            value: _.template(valueTemplate),
        };
    }

    readOptions(options) {
        this.scrollThreshold = options.scrollThreshold;
        this.selectedFacets = options.selectedFacets;
        this.facetResetButton = options.facetResetButton;
    }

    bindEvents() {
        this.mediatorBind('search:facetsRefined', this.updateCounts, this);
        this.mediatorBind('search:complete', this.addTooltips, this);
        this.mediatorBind('facet:sort', this.sortFacets, this);
        this.mediatorBind('search:complete', this.scrollToTop, this);
    }

    render() {
        let $ul,
            values = this.model.get('values');

        // record the original order so we can keep it when moving selected facets
        // to top of the list
        _.each(values, function (value, index) {
            value.sortByIndex = index;
        });

        this.$el.html(this.templates.header({
            id: this.model.get('id'),
            name: this.model.get('name')
        }));

        $ul = this.$('ul');

        // add the input to filter facets if there are more than 15 to show
        if(values && (values.length > this.scrollThreshold)) {
            $ul.before(this.templates.filter({
                name: this.model.get('name')
            }));
            $ul.addClass('with-scrolling');
        }

        _.each(values, function (value) {
            let facetValues = {
                id: value.id,
                fullName: value.fullName,
                shortName: value.shortName,
                longName: value.longName,
                count: value.count,
                checked: ''
            };

            if(this.selectedFacets.indexOf(value.fullName) !== -1) {
                facetValues.checked = 'checked';
            }

            this.$('ul').append(this.templates.value(facetValues));
        }, this);

        if(this.facetResetButton) {
            new ClearFacetLinkView({el: this.$el, model: this.model}).render();
        }

        this.updateCounts();

        this.sortFacets();

        return this;
    }

    filterVisibleFacets(ev) {
        var $facetResults,
            $input,
            regex;

        $input = $(ev.target);
        $facetResults = this.$('li:not(.divider)');
        regex = new RegExp($input.val(), 'i');

        $facetResults.addClass('hidden').filter(function () {
            var matchesLongName,
                matchesShortName,
                isSelected,
                $this;

            $this = $(this);

            isSelected = $this.find('input').prop('checked');
            matchesShortName = regex.test($this.text());
            matchesLongName = regex.test($this.find('.shortName').attr('data-long-name'));

            return isSelected || (matchesShortName || matchesLongName);
        }).removeClass('hidden');

    }

    toggleFacet(ev) {
        var facet = $(ev.target).closest('ul').attr('id'),
            name = $(ev.target).closest('li').attr('name');
        this.mediatorTrigger('model:toggleFacet', facet, name);
        this.mediatorTrigger('facet:clearLinkTrigger');
        this.sortFacets();
        this.scrollToTop();
        this.addTooltips();
    }

    updateCounts() {
        var facetCategoryList = this.$('ul#' + this.model.get('id'));
        _.each(this.model.get('values'), function (value) {
            facetCategoryList.find('li#' + value.id + ' .count').text('(' + value.count + ')');
            if(value.count === '0') {
                facetCategoryList.find('li#' + value.id).addClass('disabled');
                facetCategoryList.find('li#' + value.id + ' input').attr('disabled', true);
            }
            else {
                facetCategoryList.find('li#' + value.id).removeClass('disabled');
                facetCategoryList.find('li#' + value.id + ' input').removeAttr('disabled');
            }
        });
    }

    // el.offsetWidth and el.scrollWidth are not available when render() is
    // called, so we need to apply the tooltip at a later time
    addTooltips() {
        _.each(this.$('.shortName'), function (el) {
            var $el,
                longTextIsDifferent,
                usingEllipsis;

            $el = $(el);
            usingEllipsis = el.offsetWidth < el.scrollWidth;
            longTextIsDifferent = $el.attr('data-long-name') !== $el.text();

            if(usingEllipsis || longTextIsDifferent) {
                $el.tipsy({title: 'data-long-name', gravity: 'w', opacity: 0.9});
            }
        }, this);
    }

    clearFilterInput() {
        var $input = this.$('.facet-filter');

        this.scrollToTop();

        // clear the input text, update visible facets
        $input.val('');
        $input.keyup();
    }

    sortFacets() {
        var $listItems,
            $selected,
            values;

        values = this.model.get('values');

        // re-render the list in the original sorted order, without dividing line
        this.$('.divider').remove();
        $listItems = this.$('li').remove();
        $listItems = _.sortBy($listItems, function (li) {
            var id,
                val;

            id = $(li).attr('id');

            val = _.find(values, function (value) {
                return value.id === $(li).attr('id');
            }, this);

            return val.sortByIndex;
        }, this);
        this.$('ul').html($listItems);
        $listItems = this.$('li');

        // pop all of the selected facets out of the rendered list
        $selected = $listItems.filter(function (_, el) {
            return $(el).find('input').prop('checked');
        }).remove();

        // if there are any selected facets, render them above a dividing line
        if($selected.length > 0) {
            this.$('ul').prepend($(this.templates.divider()));
            this.$('ul').prepend($selected);
        }

        // remove leftover tooltips; the jQuery selector is globally scoped
        // because tipsy adds a div near the top of the DOM
        $('.tipsy').remove();
    }

    scrollToTop() {
        this.$('ul').scrollTop(0);
    }

}

export default FacetView;
