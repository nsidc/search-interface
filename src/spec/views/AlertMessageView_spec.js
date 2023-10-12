import Backbone from 'backbone';
import AlertMessageView from '../../views/AlertMessageView.js';
import Mediator from '../../lib/Mediator.js';

describe('AlertMessageView', function () {
    let resultsCollection, view, mediator, options;

    beforeEach(function () {
        resultsCollection = new Backbone.Collection();
        mediator = new Mediator();
        options = {'mediator': mediator};
    });

    it('should initially be hidden', function () {
        view = new AlertMessageView(options).render();

        expect(view.el.querySelector('.alert')).toHaveClass('hidden');
    });

    it('should become visible when a new message arrives', function () {
        view = new AlertMessageView(options);
        mediator.trigger('app:alert', {title: 'x', content: 'y'});

        expect(view.el.querySelector('.alert')).not.toHaveClass('hidden');
    });

    it('should close it when a user clicks the X', function () {
        view = new AlertMessageView(options).render();
        view.removeAlertMessage();

        expect(view.el.querySelector('.alert')).toHaveClass('hidden');
    });
});
