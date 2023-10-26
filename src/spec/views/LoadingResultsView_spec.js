import Backbone from "backbone";
import LoadingResultsView from '../../views/LoadingResultsView';
import Mediator from '../../lib/Mediator';

describe('LoadingResultsView', function () {
    let resultsCollection, view, mediator;

    beforeEach(function () {
        resultsCollection = new Backbone.Collection();

        mediator = new Mediator();

        view = new LoadingResultsView({
            mediator: mediator,
            resultsCollection: resultsCollection,
            facetsEnabled: true
        }).render();
    });

    it('should initially be hidden', function () {
        expect(view.el).toHaveClass('hidden');
    });

    it('should hide when the app goes home', function () {
        mediator.trigger('app:home');
        expect(view.el).toHaveClass('hidden');
    });

    it('should be visible when a new search is in progress', function () {
        mediator.trigger('search:initiated');
        expect(view.el).not.toHaveClass('hidden');
    });

    it('should be hidden when the data sets results are returned', function () {
        mediator.trigger('search:initiated');
        mediator.trigger('search:fullSearchComplete');
        mediator.trigger('search:facetsReturned');

        expect(view.el).toHaveClass('hidden');
    });

    it('should hide itself once the search is complete', function () {
        mediator.trigger('search:initiated');
        mediator.trigger('search:fullSearchComplete');
        mediator.trigger('search:facetsReturned');

        expect(view.el).toHaveClass('hidden');
    });

    it('should hide itself once the search is complete if the requests return in a different order', function () {
        mediator.trigger('search:initiated');
        mediator.trigger('search:facetsReturned');
        mediator.trigger('search:fullSearchComplete');

        expect(view.el).toHaveClass('hidden');
    });

    it('should display text indicating the search is in progress', function () {
        mediator.trigger('search:initiated');
        expect(view.el.querySelector('#loading-results-text')).toHaveTextContent('Performing Search...');
    });

    it('should display text indicating the search is complete', function () {
        mediator.trigger('search:success');
        expect(view.el.querySelector('#loading-results-text')).toHaveTextContent('Loading Results...');
    });
});
