define(['views/result_item/NsidcSupportingProgramsView'], function (NsidcSupportingProgramsView) {
  describe('NSIDC Supporting Programs View', function () {
    describe('Rendering', function () {
      var model, el, nsidcSupportingProgramsView;

      it('should display a logo for each known supporting program', function () {
        model = new Backbone.Model({ supportingPrograms: ['NOAA @ NSIDC', 'NASA NSIDC DAAC']});
        el = document.createElement('div');

        nsidcSupportingProgramsView = new NsidcSupportingProgramsView({el: el, model: model}).render();

        expect($(el).find('.supporting-program-logo').length).toBe(2);
      });

      it('should not display a logo for unknown supporting programs', function () {
        model = new Backbone.Model({ supportingPrograms: ['nsidc', 'nsidc1']});
        el = document.createElement('div');

        nsidcSupportingProgramsView = new NsidcSupportingProgramsView({el: el, model: model}).render();

        expect($(el).find('.supporting-program-logo').length).toBe(0);
      });

      it('should add a single logo for all programs starting with a common prefix', function () {
        _.each(['WDC', 'ELOKA', 'FGDC'], function (prefix) {
          model = new Backbone.Model({ supportingPrograms: [prefix + '_1', prefix + '_2']});
          el = document.createElement('div');

          nsidcSupportingProgramsView = new NsidcSupportingProgramsView({el: el, model: model}).render();

          expect($(el).find('.' + prefix).length).toBe(1);
        });
      });

      it('should add a single NOAA logo for all NOAA programs regardless of where NOAA appears in the name', function () {
        model = new Backbone.Model({ supportingPrograms: ['NOAA', 'DOC/NOAA/NESDIS/NGDC']});
        el = document.createElement('div');

        nsidcSupportingProgramsView = new NsidcSupportingProgramsView({el: el, model: model}).render();

        expect($(el).find('.NOAA').length).toBe(1);
      });

      it('should add a single AGDC logo for all NSIDC_AGDC programs', function () {
        model = new Backbone.Model({ supportingPrograms: ['AGDC']});
        el = document.createElement('div');

        nsidcSupportingProgramsView = new NsidcSupportingProgramsView({el: el, model: model}).render();

        expect($(el).find('.AGDC').length).toBe(1);
        expect($(el).find('.supporting-program-logo').length).toBe(1);
      });

      it('should add a single FGDC logo for all NSIDC_FGDC programs', function () {
        model = new Backbone.Model({ supportingPrograms: ['FGDC']});
        el = document.createElement('div');

        nsidcSupportingProgramsView = new NsidcSupportingProgramsView({el: el, model: model}).render();

        expect($(el).find('.FGDC').length).toBe(1);
        expect($(el).find('.supporting-program-logo').length).toBe(1);
      });

      it('should add a single ARC logo for all NSIDC_ARC, and NSIDC_ROCS programs', function () {
        model = new Backbone.Model({ supportingPrograms: ['NSIDC_ARC', 'NSIDC_ROCS']});
        el = document.createElement('div');

        nsidcSupportingProgramsView = new NsidcSupportingProgramsView({el: el, model: model}).render();

        expect($(el).find('.NSIDC_ARC').length).toBe(1);
        expect($(el).find('.supporting-program-logo').length).toBe(1);
      });

      it('should add a single USADCC logo for all USADCC', function () {
        model = new Backbone.Model({ supportingPrograms: ['USADCC']});
        el = document.createElement('div');

        nsidcSupportingProgramsView = new NsidcSupportingProgramsView({el: el, model: model}).render();

        expect($(el).find('.USADCC').length).toBe(1);
        expect($(el).find('.supporting-program-logo').length).toBe(1);
      });
    });
  });
});
