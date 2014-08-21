define(['lib/mediator_mixin',
       'vendor/requirejs/text!templates/alert_message_view.html'
       ],
       function (mediatorMixin,
                 messageTemplate) {

  var AlertMessageView, templates;

  templates = {
    msgTemplate : _.template(messageTemplate)
  };

  AlertMessageView = Backbone.View.extend({

    initialize : function () {
      this.message = '';
      this.bindEvents();
    },

    bindEvents: function () {
      this.mediatorBind('app:alert', this.showAlert, this);
    },

    events: {
      'click .icon-remove-sign': 'removeAlertMessage'
    },

    showAlert: function (message) {
      this.message = message;
      this.$el.html(templates.msgTemplate({messageTitle: message.title, messageContent: message.content}));
      this.$el.find('.alert').removeClass('hidden');
    },

    removeAlertMessage: function () {
      this.$el.find('.alert').addClass('hidden');
    },

    render: function () {
      this.$el.html(templates.msgTemplate({messageTitle: this.message.title, messageContent: this.message.content}));
      return this;
    }
  });

  // Mix in the mediator behaviour
  _.extend(AlertMessageView.prototype, mediatorMixin);

  return AlertMessageView;
});
