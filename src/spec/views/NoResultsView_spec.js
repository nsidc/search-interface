import NoResultsView from '../../views/NoResultsView';
import Mediator from '../../lib/Mediator';

describe('NoResultsView', function () {
    var view, mediator;

    beforeEach(function () {
        mediator = new Mediator();
        view = new NoResultsView().render();
    });

    it('should initially be hidden', function () {
        expect(view.$el).toHaveClass('hidden');
    });

    it('should be visible when no results are returned', function () {
        view.setMediator(mediator);

        mediator.trigger('search:noResults');
        expect(view.$el).not.toHaveClass('hidden');
    });

    it('should be hidden when the app goes home', function () {
        view.setMediator(mediator);
        mediator.trigger('search:noResults');

        mediator.trigger('app:home');
        expect(view.$el).toHaveClass('hidden');
    });

    it('should be hidden when a new search is performed', function () {
        view.setMediator(mediator);

        mediator.trigger('search:initiated');
        expect(view.$el).toHaveClass('hidden');
    });
});
