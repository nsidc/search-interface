define(
  ['lib/objectFactory',
  'text!templates/result_item/nsidc_result_item.html'
  ],
  function (objectFactory,
            resultItemTemplate) {

    var template, NsidcResultItemView;

    template = _.template(resultItemTemplate);

    NsidcResultItemView = Backbone.View.extend({
      className : 'result-item',
      tagName : 'div',

      initialize : function (options) {
        this.options = options;
      },

      render : function () {

        if (this.model) {
          this.$el.html(template({title: this.model.get('title'),
                                  url: this.model.get('catalogUrl'),
                                  authoritativeId: this.model.get('authoritativeId')}));

          objectFactory.createInstance('SupportingProgramsView',
              {el: this.$el.find('.supporting-programs'), model: this.model}
          ).render();

          objectFactory.createInstance('SpatialMetadataView', {
            el: this.$el.find('.spatial-coverage')[0],
            model: this.model,
            mapThumbnail: this.options.mapThumbnail,
            thumbnailBounds: this.options.thumbnailBounds,
            mapThumbnailShading: this.options.mapThumbnailShading,
            mapProjection: this.options.mapProjection,
            mapPixelSize: this.options.mapPixelSize
          }).render();

          objectFactory.createInstance('TemporalMetadataView',
            {el: this.$el.find('.temporal-coverage'), model: this.model, forceRender: true}
          ).render();

          objectFactory.createInstance('ParametersView',
              {el: this.$el.find('.parameters'), model: this.model}
          ).render();

          objectFactory.createInstance('DataFormatView',
            {el: this.$el.find('.data-formats'), model: this.model}
          ).render();

          objectFactory.createInstance('SummaryView',
              {el: this.$el.find('.summary'), model: this.model}
          ).render();
        }

        return this;
      }
    });

    return NsidcResultItemView;
  }
);
