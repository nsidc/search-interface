import InputViewBase from '../../views/InputViewBase.js';

describe('Input View Base', function () {
    let FakeView, view;
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
        expect(view.el.querySelector('#test').value).toBe('new value');
    });
});
