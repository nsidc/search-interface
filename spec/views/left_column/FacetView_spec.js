define([
  'models/FacetModel',
  'views/left_column/FacetView',
  'lib/Mediator'
],
  function (
   FacetModel,
   FacetView,
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

    var facetView, facetModel;

    beforeEach(function () {
      facetModel = new FacetModel(fakeFacetModel);

      facetView = new FacetView({
        model: facetModel,
        selectedFacets: ['National Snow and Ice Data Center | NSIDC', 'National Oceanographic Data Center | NODC'],
        facetCounts: 'static',
        facetResetButton: 'true',
        scrollThreshold: 3
      });

    });

    describe('basic rendering', function () {

      beforeEach(function () {
        facetView.render();
      });

      it('Renders a facet with its name and parameters', function () {
        expect(facetView.$('h3').length).toBe(1);
        expect(facetView.$('ul').children().length).toBe(5);
      });

      it('Renders the facet name', function () {
        expect(facetView.$('h3').text()).toContain('Data Centers');
      });

      it('Renders the count for each parameter', function () {
        expect(facetView.$('ul').find('li').first().text()).toContain('1000');
      });

      it('Checks the box when a parameter is selected', function () {
        expect(facetView.$('ul').find('li').find('input[name=\'National Snow and Ice Data Center | NSIDC\']')).toHaveAttr('checked');
      });

      it('Does not check the box when a parameter is not selected', function () {
        expect(facetView.$('ul')
               .find('li')
               .find('input[name=\'Computational Information Systems Laboratory | CISL\']')
              ).not.toHaveAttr('checked');
      });

      it('Renders selected facets at the top of the list', function () {
        var $selected = facetView.$('li').slice(0, 2),
            $deselected = facetView.$('li').slice($selected.length + 1);

        expect(_.all($selected, function (el) {
          return $(el).find('input').prop('checked');
        })).toBe(true);

        expect(_.any($deselected, function (el) {
          return $(el).find('input').prop('checked');
        })).toBe(false);
      });

      it('Renders a dividing line to separate the selected and deselected facets', function () {
        expect(facetView.$('li.divider').length).toBe(1);
      });

    });

    describe('clear all link', function () {

      it('scrolls to the top of the facet window', function () {
        // scroll down a bit
        facetView.$el.scrollTop(25);

        facetView.clearFilterInput();

        expect(facetView.$el.scrollTop()).toBe(0);
      });

      describe('typing into the filter input', function () {
        var $input;

        beforeEach(function () {
          facetView.render();

          // type junk into the filter input
          $input = facetView.$('.facet-filter');
          $input.val('adfasdfa');
          $input.keyup();
        });

        it('Clears any input typed into the filter input when the clear link is clicked', function () {
          facetView.clearFilterInput();
          expect(facetView.$('.facet-filter').val()).toBe('');
        });

        it('shows all facet values when the clear link is clicked', function () {
          expect(facetView.$('#Computational_Information_Systems_Laboratory_--_CISL')).toHaveClass('hidden');
          facetView.clearFilterInput();
          expect(facetView.$('#Computational_Information_Systems_Laboratory_--_CISL')).not.toHaveClass('hidden');
        });

      });

    });

    describe('Short/Long Names', function () {

      it('Displays the short name for each parameter for the facet', function () {
        var shortName;
        facetView.render();
        shortName = facetView.$('ul').find('li').first().find('.shortName');

        expect(shortName).not.toHaveClass('hidden');
      });

      it('Has a data-long-name attribute with the long name for each parameter for the facet', function () {
        var longName;
        facetView.render();
        longName = facetView.$('ul').find('li').first().find('.shortName').attr('data-long-name');

        expect(longName).toBe('National Snow and Ice Data Center');
      });

    });

    describe('Filtering visible facets based on the typed input', function () {
      var $filterInput,
          typeInFilter;

      beforeEach(function () {
        facetView.render();
        $filterInput = facetView.$('.facet-filter');

        typeInFilter = function (inputText) {
          $filterInput.val(inputText);
          facetView.filterVisibleFacets({ target: $filterInput });
        };
      });

      it('filters on long name', function () {
        typeInFilter('long');

        expect(facetView.$('#long_on_hover_--_short')).not.toHaveClass('hidden');
        expect(facetView.$('#Computational_Information_Systems_Laboratory_--_CISL')).toHaveClass('hidden');
      });

      it('filters on short name', function () {
        typeInFilter('short');

        expect(facetView.$('#long_on_hover_--_short')).not.toHaveClass('hidden');
        expect(facetView.$('#Computational_Information_Systems_Laboratory_--_CISL')).toHaveClass('hidden');
      });

      it('shows selected facets regardless of the typed input', function () {
        typeInFilter('adlkfjalsdf');

        expect(facetView.$('#National_Snow_and_Ice_Data_Center_--_NSIDC')).not.toHaveClass('hidden');
      });

    });

    describe('Toggle facet event handling', function () {

      it('triggers a model:toggleFacet event when a facet is selected by the checkbox', function () {
        var mediator = sinon.stub(new Mediator());
        facetView.setMediator(mediator);
        facetView.render();
        // simulate click on first item, corresponds to first item in the FacetModel's parameters array
        facetView.toggleFacet({
          target: facetView.$('ul').find('li').find('input')
        });
        expect(mediator.trigger.getCall(0).args).toEqual(
          ['model:toggleFacet', 'facet_data_centers', 'National Snow and Ice Data Center | NSIDC']
        );
      });

      it('triggers a model:toggleFacet event when a facet is selected by label', function () {
        var mediator = sinon.stub(new Mediator());
        facetView.setMediator(mediator);
        facetView.render();
        // simulate click on first item, corresponds to first item in the FacetModel's parameters array
        facetView.toggleFacet({
          target: facetView.$('ul').find('li').find('label')
        });
        expect(mediator.trigger.getCall(0).args).toEqual(
          ['model:toggleFacet', 'facet_data_centers', 'National Snow and Ice Data Center | NSIDC']
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
        expect(facetView.$('ul li#National_Snow_and_Ice_Data_Center_--_NSIDC .count').text()).toEqual('(500)');
      });

      it('disables zero count facets', function () {
        expect(facetView.$('ul li#Computational_Information_Systems_Laboratory_--_CISL input').attr('disabled')).toEqual('disabled');
      });

      it('reenables facets if the count changes from zero to a positive value', function () {
        facetModel.get('values')[1].count = '75';
        facetView.updateCounts();

        expect(facetView.$('ul li#Computational_Information_Systems_Laboratory_--_CISL input').attr('disabled')).not.toBeDefined();
      });
    });
  });
});
