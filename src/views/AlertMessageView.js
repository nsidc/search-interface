import Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../templates/alert_message_view.html';

class AlertMessageView extends Backbone.View {
    get events() {
        return {
            'click .icon-remove-sign': 'removeAlertMessage'
        };
    }

    initialize(options) {
        this.mediator = options.mediator;

        this.mediator.on('app:alert', this.showAlert, this);

        this.message = {
            title: '',
            content: ''
        };
    }

    showAlert(message) {
        this.message = message;
        this.render();
        this.$el.find('.alert').removeClass('hidden');
    }

    removeAlertMessage() {
        this.$el.find('.alert').addClass('hidden');
    }

    render() {
        this.$el.html(_.template(viewTemplate)({
            messageTitle: this.message.title,
            messageContent: this.message.content
        }));
        return this;
    }
}

export default AlertMessageView;
