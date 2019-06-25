define(['text!templates/result_item/result_keywords.html'], function (resultKeywordsTemplate) {

  var ResultKeywordsView, templates;

  templates = {
    keywords : _.template(resultKeywordsTemplate)
  };

  ResultKeywordsView = Backbone.View.extend({
    render: function () {
      var keywords = (this.model.get('keywords') || []);
      var parameters = (this.model.get('parameters') || []);
      keywords = _.union(parameters, keywords).sort();

      if (keywords && keywords.length > 0) {
        keywords = keywords.join('; ');
        this.$el.append(templates.keywords({keywords: keywords}));
      }
      return this;
    }
  });

  return ResultKeywordsView;
});
