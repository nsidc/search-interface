define(
  ['views/result_item/DetailsSectionView',
   'text!templates/result_item/nsidc_summary.html'],
  function (DetailsSectionView,
            summaryTemplate) {

    var SummaryView, sectionTemplate = '<span class=\'summary-text\'><%= data %></span>';

    // expose a constructor
    SummaryView = Backbone.View.extend({
      render : function () {
        var summarySection,
            maxLength = 320,
            summary = (this.model.get('summary') || '');

        this.$el.html(summaryTemplate);

        summarySection = new DetailsSectionView({
          sectionTemplate: sectionTemplate,
          sectionData: summary,
          expanded: summary.length <= maxLength
        }).render();

        this.$el.find('.summary-section').append(summarySection.el);

        return this;
      }

    });

    return SummaryView;
  }
);