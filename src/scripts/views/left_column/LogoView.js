define(['vendor/requirejs/text!templates/left_column/logo_nsidc.html',
       'lib/mediator_mixin'],
       function (logoTemplate,
                 mediatorMixin) {
  var LogoView;

  LogoView = Backbone.View.extend({

    initialize: function (options) {
      this.options = options;
    },

    render: function () {
      if (! (this.options.templateId === 'NSIDC' ||
          this.options.templateId === 'ACADIS')) {
        throw new Error('Invalid template ID');
      }

      this.$el.html(_.template(logoTemplate));

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
