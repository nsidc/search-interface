define(['views/result_item/DetailsView',
       'vendor/requirejs/text!templates/result_item/details_table.html'],
       function (DetailsView,
                 detailsTableTemplate) {
  var DetailsTableView, templates;

  templates = {
    details: _.template(detailsTableTemplate)
  };

  DetailsTableView = DetailsView.extend({

    render: function () {
      this.$el.append(
        templates.details(
          { summary: this.model.get('summary'),
            keywords: this.model.get('keywords'),
            updated: this.model.get('updated'),
            dataFormats: this.model.get('dataFormats')}));

      return this;
    }

  });

  return DetailsTableView;
});
