import FacetModel from '../../../models/FacetModel.js';
import FacetView from '../../../views/left_column/FacetView.js';
import Mediator from '../../../lib/Mediator.js';
import _ from 'underscore';
import {rebindEvent} from "../../rebindEvents.js";

let fakeFacetModel = {
    id: 'facet_data_centers',
    name: 'Data Centers',
    values  : [{
        id: 'National_Snow_and_Ice_Data_Center_--_NSIDC',
        fullName: 'National Snow and Ice Data Center | NSIDC',
        longName: 'National Snow and Ice Data Center',
        shortName: 'NSIDC',
        count: '1000'
    }, {
        id: 'Computational_Information_Systems_Laboratory_--_CISL',
        fullName: 'Computational Information Systems Laboratory | CISL',
        longName: 'Computational Information Systems Laboratory',
        shortName: 'CISL',
        count: '330'
    }, {
        id: 'National_Oceanographic_Data_Center_--_NODC',
        fullName: 'National Oceanographic Data Center | NODC',
        longName: 'National Oceanographic Data Center',
        shortName: 'NODC',
        count: '130'
    }, {
        id: 'long_on_hover_--_short',
        fullName: 'long on hover | short',
        longName: 'long on hover',
        shortName: 'short',
        count: '0'
    }]
};

describe('Facet view', function () {

    let facetView, facetModel, mediator;

    beforeEach(function () {
        facetModel = new FacetModel(fakeFacetModel);
        mediator = new Mediator();

        facetView = new FacetView({
            model: facetModel,
            selectedFacets: ['National Snow and Ice Data Center | NSIDC', 'National Oceanographic Data Center | NODC'],
            facetCounts: 'static',
            facetResetButton: 'true',
            config: {
                scrollThreshold: 3
            },
            mediator: mediator
        });

    });

    describe('basic rendering', function () {

        beforeEach(function () {
            facetView.render();
        });

        it('Renders a facet with its name and parameters', function () {
            expect(facetView.el.querySelectorAll('h3').length).toBe(1);
            expect(facetView.el.querySelector('ul').children.length).toBe(5);
        });

        it('Renders the facet name', function () {
            expect(facetView.el.querySelector('h3').textContent).toContain('Data Centers');
        });

        it('Renders the count for each parameter', function () {
            expect(facetView.el.querySelector('ul').querySelector('li').textContent).toContain('1000');
        });

        it('Checks the box when a parameter is selected', function () {
            expect(
              facetView.el
                .querySelector('ul')
                .querySelector('input[name=\'National Snow and Ice Data Center | NSIDC\']')
            ).toBeChecked();
        });

        it('Does not check the box when a parameter is not selected', function () {
            expect(
              facetView.el
                .querySelector('ul')
                .querySelector('input[name=\'Computational Information Systems Laboratory | CISL\']')
            ).not.toBeChecked();
        });

        it('Renders selected facets at the top of the list', function () {
            let selected = [], deselected = [];

            facetView.el.querySelectorAll('li').forEach(entry => {
               if (selected.length < 2) {
                   selected.push(entry);
               } else if (entry.innerHTML){
                   deselected.push(entry);
               }
            });

            expect(_.all(selected, function (el) {
                return el.querySelector('input').hasAttribute('checked');
            })).toBe(true);

            expect(_.any(deselected, function (el) {
                return el.querySelector('input').hasAttribute('checked');
            })).toBe(false);
        });

        it('Renders a dividing line to separate the selected and deselected facets', function () {
            expect(facetView.el.querySelectorAll('li.divider').length).toBe(1);
        });

    });

    describe('clear all link', function () {

        it('scrolls to the top of the facet window', function () {
            facetView.render();

            // scroll down a bit
            facetView.el.querySelector('ul').scrollTop = 25;

            facetView.clearFilterInput();

            expect(facetView.el.querySelector('ul').scrollTop).toBe(0);
        });

        describe('typing into the filter input', function () {
            let input;

            beforeEach(function () {
                facetView.render();

                // type junk into the filter input
                input = facetView.el.querySelector('.facet-filter');
                input.value = 'adfasdfa';
                input.dispatchEvent(new Event('keyup', { bubbles: true }));
            });

            it('Clears any input typed into the filter input when the clear link is clicked', function () {
                facetView.clearFilterInput();
                expect(facetView.el.querySelector('.facet-filter').value).toBe('');
            });

            it('shows all facet values when the clear link is clicked', function () {
                expect(facetView.el.querySelector('#Computational_Information_Systems_Laboratory_--_CISL')).toHaveClass('hidden');
                facetView.clearFilterInput();
                expect(facetView.el.querySelector('#Computational_Information_Systems_Laboratory_--_CISL')).not.toHaveClass('hidden');
            });

        });

    });

    describe('Short/Long Names', function () {

        it('Displays the short name for each parameter for the facet', function () {
            let shortName;
            facetView.render();
            shortName = facetView.el.querySelector('ul').querySelector('li').querySelector('.shortName');

            expect(shortName).not.toHaveClass('hidden');
        });

        it('Has a data-long-name attribute with the long name for each parameter for the facet', function () {
            let longName;
            facetView.render();
            longName = facetView.el.querySelector('ul').querySelector('li').querySelector('.shortName').getAttribute('data-long-name');

            expect(longName).toBe('National Snow and Ice Data Center');
        });

    });

    describe('Filtering visible facets based on the typed input', function () {
        let filterInput,
            typeInFilter;

        beforeEach(function () {
            facetView.render();
            filterInput = facetView.el.querySelector('.facet-filter');

            typeInFilter = function (inputText) {
                filterInput.value = inputText;
                facetView.filterVisibleFacets({ target: filterInput });
            };
        });

        it('filters on long name', function () {
            typeInFilter('long');

            expect(facetView.el.querySelector('#long_on_hover_--_short')).not.toHaveClass('hidden');
            expect(facetView.el.querySelector('#Computational_Information_Systems_Laboratory_--_CISL')).toHaveClass('hidden');
        });

        it('filters on short name', function () {
            typeInFilter('short');

            expect(facetView.el.querySelector('#long_on_hover_--_short')).not.toHaveClass('hidden');
            expect(facetView.el.querySelector('#Computational_Information_Systems_Laboratory_--_CISL')).toHaveClass('hidden');
        });

        it('shows selected facets regardless of the typed input', function () {
            typeInFilter('adlkfjalsdf');

            expect(facetView.el.querySelector('#National_Snow_and_Ice_Data_Center_--_NSIDC')).not.toHaveClass('hidden');
        });

    });

    describe('Toggle facet event handling', function () {
        let spy;

        beforeEach(function () {
            spy = jest.spyOn(facetModel, 'toggleSelectedFacet');
            rebindEvent(mediator, 'model:toggleFacet', spy, facetModel);

            facetView.render();
        });

        it('triggers a model:toggleFacet event when a facet is selected by the checkbox', function () {
            // simulate click on first item, corresponds to first item in the FacetModel's parameters array
            facetView.toggleFacet({
                target: facetView.el.querySelector('ul').querySelector('li').querySelector('input')
            });
            expect(spy).toHaveBeenCalledWith(
                'facet_data_centers', 'National Snow and Ice Data Center | NSIDC'
            );
        });

        it('triggers a model:toggleFacet event when a facet is selected by label', function () {
            // simulate click on first item, corresponds to first item in the FacetModel's parameters array
            facetView.toggleFacet({
                target: facetView.el.querySelector('ul').querySelector('li').querySelector('label')
            });
            expect(spy).toHaveBeenCalledWith(
                'facet_data_centers', 'National Snow and Ice Data Center | NSIDC'
            );
        });
    });

    describe('Refined search event handling', function () {

        beforeEach(function () {
            facetView.render();
            facetModel.get('values')[0].count = '500';
            facetModel.get('values')[1].count = '0';
            facetView.updateCounts();
        });

        it('changes the counts being displayed', function () {
            expect(facetView.el.querySelector('ul li#National_Snow_and_Ice_Data_Center_--_NSIDC .count').textContent).toEqual('(500)');
        });

        it('disables zero count facets', function () {
            expect(facetView.el.querySelector('ul li#Computational_Information_Systems_Laboratory_--_CISL input').getAttribute('disabled')).toEqual('disabled');
        });

        it('reenables facets if the count changes from zero to a positive value', function () {
            facetModel.get('values')[1].count = '75';
            facetView.updateCounts();

            expect(facetView.el.querySelector('ul li#Computational_Information_Systems_Laboratory_--_CISL input').getAttribute('disabled')).toBeNull();
        });
    });
});
