define(
  ['views/InputViewBase'],
  function (InputViewBase) {
    describe('Input View Base', function () {
      var FakeView, view;
      FakeView = InputViewBase.extend({
        render: function () {
          this.$el.html('<input id="test" type="text" value="default"/>');
          return this;
        }
      });

      beforeEach(function () {
        view = new FakeView().render();
      });

      it('gets the value of an input', function () {
        expect(view.getInputField('test')).toBe('default');
      });

      it('sets the value of an input', function () {
        view.setInputField('test', 'new value');
        expect(view.$el.find('#test').val()).toBe('new value');
      });
    });
  }
);