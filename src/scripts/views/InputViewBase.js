define(function () {
  return Backbone.View.extend({
    findInputField: function (input) {
      return this.$el.find('#' + input);
    },

    getInputField: function (input) {
      return this.findInputField(input).val();
    },

    setInputField: function (input, value) {
      this.findInputField(input).val(value);
    },

    isValid: function () {
      return true;
    }
  });
});