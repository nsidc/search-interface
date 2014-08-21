define(['vendor/requirejs/text!templates/result_item/updated.html'],
       function (updatedTemplate) {

  var UpdatedView, templates;

  templates = {
    updated : _.template(updatedTemplate)
  };

  UpdatedView = Backbone.View.extend({
    render: function () {
      var updated = this.model.get('updated');
      if (updated && updated.length > 0) {
        this.$el.append(templates.updated({updated: updated}));
      }
      return this;
    }
  });

  return UpdatedView;
});
