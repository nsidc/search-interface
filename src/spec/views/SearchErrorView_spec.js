import SearchErrorView from '../../views/SearchErrorView';
import Mediator from '../../lib/Mediator';

describe('Search Error View', function () {
    let view, mediator;

    beforeEach(function () {
        mediator = new Mediator();

        view = new SearchErrorView({mediator: mediator}).render();
    });

    it('should become visible when a search error occurs', function () {
        mediator.trigger('search:error');
        expect(view.el).not.toHaveClass('hidden');
    });

    it('should hide itself once a new search is started', function () {
        mediator.trigger('search:error');
        mediator.trigger('search:initiated');

        expect(view.el).toHaveClass('hidden');
    });
});
