import FacetModel from '../../../models/FacetModel';
import FacetView from '../../../views/left_column/FacetView';
import ClearFacetLinkView from '../../../views/left_column/ClearFacetLinkView';
import Mediator from '../../../lib/Mediator';

let fakeFacetModelData = {
    id: 'facet_data_centers',
    name: 'Data Centers',
    values  : [{
        id: 'National_Snow_and_Ice_Data_Center_--_NSIDC',
        fullName: 'National Snow and Ice Data Center | NSIDC',
        longName: 'National Snow and Ice Data Center',
        shortName: 'NSIDC',
        count: '1000'
    }, {
        id: 'National_Oceanographic_Data_Center_--_NODC',
        fullName: 'National Oceanographic Data Center | NODC',
        longName: 'National Oceanographic Data Center',
        shortName: 'NODC',
        count: '130'
    }]
};

describe('Clear facet link view', function () {
    let facetView, facetModel;
    let mediator;

    // TODO: The original tests had the selectedFacets set, but that meant some of the expected default states
    // were incorrect.  Most of the tests can be duplicated here, but with some different results.
    // Ran out of time to actually do the implementation for those, but added one related to the fixed functionality
    describe('for facet with previously-selected entries', function () {
        beforeEach(function () {
            mediator = new Mediator();
            facetModel = new FacetModel(fakeFacetModelData, {mediator: mediator});

            facetView = new FacetView({
                model: facetModel,
                selectedFacets: ['National Snow and Ice Data Center | NSIDC', 'National Oceanographic Data Center | NODC'],
                facetCounts: 'static',
                config: {
                    facetResetButton: 'true',
                    scrollThreshold: 1
                },
                mediator: mediator
            });

            facetView.render();
            document.body.append(facetView.el);
        });

        it('renders a visible clear facet link', function () {
            expect(facetView.el.querySelectorAll('.facet_clear_link').length).toBe(1);
            expect(facetView.el.querySelector('.facet_clear_link')).toBeVisible();
        });
    });

    describe('for facet with no selected entries', function () {
        beforeEach(function () {
            mediator = new Mediator();
            facetModel = new FacetModel(fakeFacetModelData, {mediator: mediator});

            facetView = new FacetView({
                model: facetModel,
                selectedFacets: [],
                facetCounts: 'static',
                config: {
                    facetResetButton: 'true',
                    scrollThreshold: 1
                },
                mediator: mediator
            });

            facetView.render();
            document.body.append(facetView.el);
        });

        it('renders a hidden clear facet link', function () {
            expect(facetView.el.querySelectorAll('.facet_clear_link').length).toBe(1);
            expect(facetView.el.querySelector('.facet_clear_link')).not.toBeVisible();
        });

        it('shows the clear facet link when the filter input is used', function () {
            // Link should be hidden to start
            expect(facetView.el.querySelector('.facet_clear_link')).not.toBeVisible();

            // start typing
            let filter = facetView.el.querySelector('.facet-filter');
            filter.value = 'sea';
            filter.dispatchEvent(new Event('keyup', { bubbles: true }));

            // it should be visible now
            expect(facetView.el.querySelector('.facet_clear_link')).toBeVisible();
        });

        it('hides the clear facet link when the filter input is used then cleared', function () {
            // it's hidden to start
            expect(facetView.el.querySelector('.facet_clear_link')).not.toBeVisible();

            // start typing, it's visible
            let filter = facetView.el.querySelector('.facet-filter');
            filter.value = 'sea';
            filter.dispatchEvent(new Event('keyup', { bubbles: true }));
            expect(facetView.el.querySelector('.facet_clear_link')).toBeVisible();

            filter.value = '';
            filter.dispatchEvent(new Event('keyup', { bubbles: true }));
            expect(facetView.el.querySelector('.facet_clear_link')).not.toBeVisible();
        });

        it('Shows the clear facet link when a facet is selected', function () {
            // it's hidden to start
            expect(facetView.el.querySelector('.facet_clear_link')).not.toBeVisible();

            // select a facet
            facetView.el.querySelector('#National_Snow_and_Ice_Data_Center_--_NSIDC').querySelector('input').dispatchEvent(
              new Event('click', { bubbles: true })
            );

            // it should now be visible
            expect(facetView.el.querySelectorAll('.facet_clear_link').length).toBe(1);
            expect(facetView.el.querySelector('.facet_clear_link')).toBeVisible();
        });

        it('Clears the facet and hides the link when the clear link is clicked', function () {
            // select a facet
            facetView.el.querySelector('#National_Snow_and_Ice_Data_Center_--_NSIDC').querySelector('input').dispatchEvent(
              new Event('click', { bubbles: true })
            );
            expect(facetModel.selected()).toBe(true);

            // click the clear all link
            facetView.el.querySelector('.facet_clear_link').dispatchEvent(new Event('click', {bubbles: true}));

            // Make sure everything is de-selected
            expect(facetModel.selected()).toBe(false);
            expect(facetView.el.querySelector('.facet_clear_link')).not.toBeVisible();
        });
    });
});
