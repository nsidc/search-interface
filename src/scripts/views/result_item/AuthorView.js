define(['vendor/requirejs/text!templates/result_item/author.html'], function (authorTemplate) {

  var AuthorView, templates;

  templates = {
    author : _.template(authorTemplate)
  };

  AuthorView = Backbone.View.extend({
    render: function () {
      var author = this.model.get('author');
      if (author && author.length > 0) {
        this.$el.append(templates.author({author: author.join(', ')}));
      }
      return this;
    }
  });

  return AuthorView;
});
