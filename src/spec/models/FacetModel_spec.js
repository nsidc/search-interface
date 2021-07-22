import FacetModel from '../../models/FacetModel';

  describe('Facet Model', function () {
    var model;

    describe('setting the facet from a hash of options', function () {

      beforeEach(function () {
        model = new FacetModel({
          id: 'data_centers',
          displayName: 'Data Centers',
          values: [{
            id: 'National Snow and Ice Data Center -- NSIDC',
            fullName: 'National Snow and Ice Data Center | NSIDC',
            shortName: 'NSIDC',
            selected: false,
            count: 1000
          }, {
            id: 'Computational Information Systems Laboratory | COMPLAB',
            fullName: 'Computational Information Systems Laboratory | COMPLAB',
            shortName: 'COMPLAB',
            selected: false,
            count: 330
          }, {
            id: 'National Oceanographic Data Center',
            fullName: 'National Oceanographic Data Center',
            shortName: 'NODC',
            selected: false,
            count: 130
          }]
        });
      });

      it('sets the facet name', function () {
        expect(model.get('displayName')).toBe('Data Centers');
      });

      it('sets the facet id', function () {
        expect(model.get('id')).toBe('data_centers');
      });

      describe('the facet values', function () {
        it('creates each facet value', function () {
          expect(model.get('values').length).toBe(3);
        });

        it('sets the values for each value', function () {
          expect(model.get('values')[0].fullName).toBe('National Snow and Ice Data Center | NSIDC');
          expect(model.get('values')[0].count).toBe(1000);
        });
      });

      describe('the facet value toggle and state detection', function () {
        it('sets the selected facet value', function () {
          model.toggleSelectedFacet('data_centers', 'National Oceanographic Data Center');
          expect(model.get('values')[2].selected).toBe(true);
          model.toggleSelectedFacet('data_centers', 'National Oceanographic Data Center');
          expect(model.get('values')[2].selected).toBe(false);
        });

        it('detects the selected state', function () {
          expect(model.selected()).toBe(false);
          model.toggleSelectedFacet('data_centers', 'National Oceanographic Data Center');
          expect(model.selected()).toBe(true);
        });
      });
    });
  });
