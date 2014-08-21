define(
  ['vendor/requirejs/text!templates/result_item/acadis_temporal_metadata.html',
   'vendor/requirejs/text!templates/result_item/nsidc_temporal_metadata.html'],
  function (acadisTemporalTemplate,
            nsidcTemporalTemplate) {

    var template, TemporalMetadataView;

    // expose a constructor
    TemporalMetadataView = Backbone.View.extend({

      initialize : function (options) {
        this.options = options;
      },

      render : function () {

        var currentTemplate, range;

        if (this.options.spaced === true) {
          currentTemplate = acadisTemporalTemplate;
        } else {
          currentTemplate = nsidcTemporalTemplate;
        }

        template = _.template(currentTemplate);

        range = this.model.get('dateRanges');
        if ((range && range.length > 0) || this.options.forceRender) {
          this.$el.html(template({dateRanges: this.model.get('dateRanges')}));
        }

        return this;
      }
    });

    return TemporalMetadataView;
  }
);
