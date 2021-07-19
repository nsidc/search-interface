define(['views/result_item/NsidcSummaryView'], function (NsidcSummaryView) {
  describe('NSIDC Result Item View', function () {
    describe('Rendering', function () {
      var model, el, nsidcSummaryView;

      it('should display the word Summary when given a summary', function () {
        model = new Backbone.Model({ summary: 'some text' });
        el = document.createElement('div');

        nsidcSummaryView = new NsidcSummaryView({el: el, model: model});

        nsidcSummaryView.render();

        expect($(el).html()).toContain('Summary');
      });

      it('should display the word Summary when given an empty summary', function () {
        model = new Backbone.Model({ });
        el = document.createElement('div');

        nsidcSummaryView = new NsidcSummaryView({el: el, model: model});

        nsidcSummaryView.render();

        expect($(el).html()).toContain('Summary');
      });

      // TODO: SKIPPED because of intermittent failures when running, need to investigate.
      xdescribe('with a short summary', function () {
        var summaryText = 'A short summary';

        beforeEach(function () {
          model = new Backbone.Model({summary: summaryText});
          nsidcSummaryView = new NsidcSummaryView({el: el, model: model});
          nsidcSummaryView.render();
        });

        it('contains the summary text', function () {
          expect($(el).find('.summary-text')).toHaveText(summaryText);
        });

        it('displays the entire summary text', function () {
          expect($(el).find('.section')).toHaveClass('expanded');
        });
      });

      // TODO: SKIPPED because of intermittent failures when running, need to investigate.
      xdescribe('with a long summary', function () {
        var summaryText = 'A reallyreallyreallyreallyreallyreallyreallyreallyreallyreallyreally' +
            'reallyreallyreallyreallyreallyreallyreallyreallyreallyreallyreallyreallyreallyreally' +
            'reallyreallyreallyreallyreallyreallyreallyreallyreallyreallyreallyreallyreallyreally' +
            'reallyreallyreallyreallyreallyreallyreallyreallyreallyreallyreallyreallyreallyreally' +
            'really long summary';

        beforeEach(function () {
          model = new Backbone.Model({summary: summaryText});
          nsidcSummaryView = new NsidcSummaryView({el: el, model: model});
          nsidcSummaryView.render();
        });

        it('contains the summary text', function () {
          expect($(el).find('.summary-text')).toHaveText(summaryText);
        });

        it('displays the first part of the summary text', function () {
          expect($(el).find('.section')).not.toHaveClass('expanded');
        });
      });
    });
  });
});