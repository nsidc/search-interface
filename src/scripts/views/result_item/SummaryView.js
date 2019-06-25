define(['views/result_item/DetailsView',
       'views/result_item/ResultKeywordsView',
       'views/result_item/UpdatedView',
       'text!templates/result_item/short_summary.html',
       'text!templates/result_item/long_summary.html'],
       function (DetailsView,
                 ResultKeywordsView,
                 UpdatedView,
                 shortSummaryTemplate,
                 longSummaryTemplate) {

  var SummaryView, templates;

  templates = {
    shortSummary: _.template(shortSummaryTemplate),
    longSummary: _.template(longSummaryTemplate)
  };

  SummaryView = DetailsView.extend({

    render: function () {
      var summary = this.model.get('summary'),
          keywords = this.model.get('keywords'),
          maxLength = 320,
          summaryLength = 0,
          keywordsLength = 0,
          template;

      if (summary !== undefined && summary.length > 0) {
        summaryLength = summary.length;
      }

      if (keywords !== undefined && keywords.length > 0) {
        keywordsLength = keywords.join('; ').length;
      }

      template = (
        (summaryLength + keywordsLength) > maxLength) ?
        templates.longSummary({summary: summary}) : templates.shortSummary({summary: summary});

      this.$el.append(template);

      if ((summaryLength + keywordsLength) < maxLength) {
        this.$el.addClass('expanded');
      }

      new ResultKeywordsView({
        el: this.$el.find('.keywords'),
        model: this.model
      }).render();

      new UpdatedView({
        el: this.$el.find('.updated'),
        model: this.model
      }).render();

      return this;
    }

  });

  return SummaryView;
});
