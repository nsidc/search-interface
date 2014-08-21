define([
  'models/FacetModel',
  'views/left_column/FacetView',
  'views/left_column/ClearFacetLinkView',
  'lib/Mediator'
],
  function (
    FacetModel,
    FacetView,
    ClearFacetLinkView,
    Mediator
    ) {

    var fakeFacetModel = {
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
      var facetView, facetModel;

      beforeEach(function () {
        facetModel = new FacetModel(fakeFacetModel);

        facetView = new FacetView({
          model: facetModel,
          selectedFacets: ['National Snow and Ice Data Center | NSIDC', 'National Oceanographic Data Center | NODC'],
          facetCounts: 'static',
          facetResetButton: 'true',
          scrollThreshold: 1
        });
      });

      it('renders a hidden clear facet link', function () {
        facetView.render();
        expect(facetView.$('.facet_clear_link').length).toBe(1);
        expect(facetView.$('.facet_clear_link').css('display')).toBe('none');
      });

      it('shows the clear facet link when the filter input is used', function () {
        // initial render, it's hidden
        facetView.render();
        expect(facetView.$('.facet_clear_link').css('display')).toBe('none');

        // start typing, it's visible
        facetView.$('.facet-filter').val('sea');
        facetView.$('.facet-filter').keyup();
        expect(facetView.$('.facet_clear_link').css('display')).toBe('inline');
      });

      it('Shows the clear facet link when a facet is selected', function () {
        facetView.facetResetButton = false;
        facetView.render();
        facetModel.toggleSelectedFacet('facet_data_centers', 'National Snow and Ice Data Center | NSIDC');
        new ClearFacetLinkView({el: facetView.el, model: facetModel}).render();
        expect(facetView.$('.facet_clear_link').length).toBe(1);
        expect(facetView.$('.facet_clear_link').css('display')).not.toBe('none');
      });

      it('Clears the facet when the clear link is clicked', function () {
        var clearFacetLinkView, mediator = sinon.stub(new Mediator());
        facetView.facetResetButton = false;

        facetView.render();
        facetModel.toggleSelectedFacet('facet_data_centers', 'National Snow and Ice Data Center | NSIDC');
        clearFacetLinkView = new ClearFacetLinkView({el: facetView.el, model: facetModel});
        clearFacetLinkView.setMediator(mediator);
        clearFacetLinkView.render();
        facetView.$('.facet_clear_link').trigger('click');

        expect(facetView.$('input:checked').length).toBe(0);
        expect(mediator.trigger.getCall(0).args).toEqual(['model:clearFacet', 'facet_data_centers']);
        expect(mediator.trigger.getCall(1).args).toEqual(['model:clearSelectedFacet', 'facet_data_centers']);
        expect(mediator.trigger.getCall(2).args).toEqual(['facet:sort']);
      });
    });
  });

