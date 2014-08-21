define(['views/result_item/AuthorView',
       'views/result_item/SpatialMetadataView',
       'views/result_item/NsidcTemporalMetadataView',
       'views/result_item/DatacenterView',
       'views/result_item/SummaryView',
       'vendor/requirejs/text!templates/result_item/result_item.html'],
       function (AuthorView,
                 SpatialMetadataView,
                 TemporalMetadataView,
                 DatacenterView,
                 SummaryView,
                 resultItemTemplate) {

  var templates, ResultItemView;

  templates = {
    item : _.template(resultItemTemplate)
  };

  ResultItemView = Backbone.View.extend({
    className : 'result-item',
    tagName : 'div',

    initialize : function (options) {
      this.options = options;
    },

    render : function () {
      if (this.model) {
        this.$el.html(templates.item({title: this.model.get('title'),
                                      url: this.model.get('catalogUrl')}));

        new AuthorView({
          el: this.$el.find('.author')[0],
          model: this.model
        }).render();

        new SpatialMetadataView({
          el: this.$el.find('.spatial-coverage')[0],
          model: this.model,
          mapThumbnail: this.options.mapThumbnail,
          thumbnailBounds: this.options.thumbnailBounds,
          mapThumbnailShading: this.options.mapThumbnailShading,
          mapProjection: this.options.mapProjection,
          mapPixelSize: this.options.mapPixelSize
        }).render();

        new TemporalMetadataView(
          {el: this.$el.find('.temporal-coverage')[0], model: this.model, forceRender: false, spaced: true }
        ).render();

        new DatacenterView({
          el: this.$el.find('.datacenter'),
          model: this.model
        }).render();

        new SummaryView({
          el: this.$el.find('.summary'),
          model: this.model
        }).render();
      }

      return this;
    }
  });

  return ResultItemView;
});
