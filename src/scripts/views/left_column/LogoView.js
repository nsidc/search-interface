define(['vendor/requirejs/text!templates/left_column/logo_nsidc.html',
       'vendor/requirejs/text!templates/left_column/logo_acadis.html',
       'lib/mediator_mixin'],
       function (nsidcLogoTemplate,
                 acadisLogoTemplate,
                 mediatorMixin) {
  var LogoView;

  LogoView = Backbone.View.extend({

    initialize: function (options) {
      this.options = options;
    },

    render: function () {
      var currentTemplate;

      if (this.options.templateId === 'NSIDC') {
        currentTemplate = nsidcLogoTemplate;
      } else if (this.options.templateId === 'ACADIS') {
        currentTemplate = acadisLogoTemplate;
      } else {
        throw new Error('Invalid template ID');
      }

      this.$el.html(_.template(currentTemplate));

      return this;
    },

    show: function () {
      this.$el.removeClass('hidden');
    },

    hide: function () {
      this.$el.addClass('hidden');
    }


  });

  _.extend(LogoView.prototype, mediatorMixin);

  return LogoView;
});
