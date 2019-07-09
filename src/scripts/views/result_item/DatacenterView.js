define(['text!templates/result_item/datacenter.html'], function (datacenterTemplate) {

  var DatacenterView, templates;

  templates = {
    datacenter : _.template(datacenterTemplate)
  };

  DatacenterView = Backbone.View.extend({
    render: function () {
      var dataCenters = this.model.get('dataCenterNames');
      if (dataCenters && dataCenters.length > 0) {
        this.$el.append(templates.datacenter({datacenter: dataCenters.join(' / ')}));
      }
      return this;
    }
  });

  return DatacenterView;
});
