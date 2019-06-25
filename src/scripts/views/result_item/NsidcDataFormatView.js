define(
  ['text!templates/result_item/nsidc_data_format.html'],
  function (dataFormatTemplate) {

    var DataFormatView,
      sectionTemplate = '<% _.each(data, function (df) { %>' +
        '<div class="data-format pipe-separated-value"><%= df %></div>' +
        '<% }); %>';

    DataFormatView = Backbone.View.extend({

      render : function () {
        var dataFormats = (this.model.get('dataFormats') || '');
        this.$el.html(dataFormatTemplate);
        this.$el.find('.data-format-section').append(_.template(sectionTemplate)({data: dataFormats}));

        return this;
      }
    });

    return DataFormatView;
  }
);