define(['views/result_item/NsidcTemporalMetadataView'], function (NsidcTemporalMetadataView) {
  describe('NSIDC Temporal Metadata View', function () {
    describe('Rendering', function () {
      it('should display the words Temporal Coverage when given a temporal range', function () {
        var model, el, nsidcTemporalMetadataView;
        model = new Backbone.Model({ dtstart: '2013-01-01', dtend: '2013-01-31' });
        el = document.createElement('div');

        nsidcTemporalMetadataView = new NsidcTemporalMetadataView({el: el, model: model, forceRender: true, spaced: false});

        nsidcTemporalMetadataView.render();

        expect($(el).html()).toContain('Temporal Coverage');
      });

      it('should display the entire range when start and end are present', function () {
        var model, el, nsidcTemporalMetadataView;
        model = new Backbone.Model({dateRanges: [{startDate: '2013-01-01', endDate: '2013-01-31' }]});
        el = document.createElement('div');

        nsidcTemporalMetadataView = new NsidcTemporalMetadataView({el: el, model: model});

        nsidcTemporalMetadataView.render();

        expect($(el).find('time.dtstart')).toHaveText('2013-01-01');
        expect($(el).find('time.dtend')).toHaveText('2013-01-31');
      });

      it('should display the start date and continuous when end is empty', function () {
        var model, el, nsidcTemporalMetadataView;
        model = new Backbone.Model({dateRanges: [{ startDate: '2013-01-01' }]});
        el = document.createElement('div');

        nsidcTemporalMetadataView = new NsidcTemporalMetadataView({el: el, model: model});

        nsidcTemporalMetadataView.render();

        expect($(el).find('time.dtstart')).toHaveText('2013-01-01');
        expect($(el).find('time.dtend')).not.toExist();
        expect($(el).find('span.dtend')).toHaveText('continuous');
      });

      it('should display only the end date when start is empty', function () {
        var model, el, nsidcTemporalMetadataView;
        model = new Backbone.Model({dateRanges: [{ endDate: '2013-01-01' }]});
        el = document.createElement('div');

        nsidcTemporalMetadataView = new NsidcTemporalMetadataView({el: el, model: model});

        nsidcTemporalMetadataView.render();

        expect($(el).find('time.dtend')).toHaveText('2013-01-01');
        expect($(el).find('time.dtstart')).not.toExist();
      });

      it('nothing should be displayed when start and end dates are empty', function () {
        var model, el, nsidcTemporalMetadataView;

        model = new Backbone.Model({dtstart: '', dtend: ''});
        el = document.createElement('div');

        nsidcTemporalMetadataView = new NsidcTemporalMetadataView({el: el, model: model});

        nsidcTemporalMetadataView.render();

        expect($(el).find('time.dtstart')).not.toExist();
        expect($(el).find('time.dtend')).not.toExist();
        expect($(el).find('span.dtend')).not.toExist('continuous');
      });

      it('should display the words Temporal Coverage without a temporal range', function () {
        var model, el, nsidcTemporalMetadataView;
        model = new Backbone.Model({ dtstart: '', dtend: '' });
        el = document.createElement('div');

        nsidcTemporalMetadataView = new NsidcTemporalMetadataView({el: el, model: model, forceRender: true, spaced: false});

        nsidcTemporalMetadataView.render();

        expect($(el).html()).toContain('Temporal Coverage');
      });
    });
  });
});
