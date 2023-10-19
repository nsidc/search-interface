import NoResultsView from '../../views/NoResultsView';
import Mediator from '../../lib/Mediator';

describe('NoResultsView', function () {
    let view, mediator;

    beforeEach(function () {
        mediator = new Mediator();
        view = new NoResultsView({mediator: mediator}).render();
    });

    it('should initially be hidden', function () {
        expect(view.el).toHaveClass('hidden');
    });

    it('should be visible when no results are returned', function () {
        mediator.trigger('search:noResults');
        expect(view.el).not.toHaveClass('hidden');
    });

    it('should be hidden when the app goes home', function () {
        mediator.trigger('search:noResults');
        mediator.trigger('app:home');
        expect(view.el).toHaveClass('hidden');
    });

    it('should be hidden when a new search is performed', function () {
        mediator.trigger('search:initiated');
        expect(view.el).toHaveClass('hidden');
    });
});
