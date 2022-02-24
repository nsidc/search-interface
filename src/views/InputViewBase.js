import * as Backbone from 'backbone';

export default class InputViewBase extends Backbone.View {
    findInputField(input) {
        return this.$el.find('#' + input);
    }

    getInputField(input) {
        return this.findInputField(input).val();
    }

    setInputField(input, value) {
        this.findInputField(input).val(value);
    }

    isValid() {
        return true;
    }
}
