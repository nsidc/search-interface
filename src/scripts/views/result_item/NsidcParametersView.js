define(
  ['vendor/requirejs/text!templates/result_item/nsidc_parameters.html'],
  function (parametersTemplate) {

    var ParameterView,
        sectionTemplate = '<% _.each(data, function (p) { %>' +
                          ' <div class="parameter pipe-separated-value"><%= p %></div>' +
                          '<% }); %>';

    ParameterView = Backbone.View.extend({
      render : function () {
        var parameters = (this.model.get('parameters') || '');
        this.$el.html(parametersTemplate);
        this.$el.find('.parameters-section').append(_.template(sectionTemplate)({data: parameters}));

        return this;
      }

    });

    return ParameterView;
  }
);
