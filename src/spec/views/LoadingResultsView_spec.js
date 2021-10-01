import LoadingResultsView from '../../../views/LoadingResultsView';
import Mediator from '../../../lib/Mediator';

describe('LoadingResultsView', function () {
  var resultsCollection, view, mediator;

  beforeEach(function () {

    resultsCollection = new Backbone.Collection();

    mediator = new Mediator();

    view = new LoadingResultsView({
      resultsCollection: resultsCollection,
      facetsEnabled: true
    }).render();
  });

  it('should initially be hidden', function () {
    expect(view.$el).toHaveClass('hidden');
  });

  it('should hide when the app goes home', function () {
    view.setMediator(mediator);

    mediator.trigger('app:home');
    expect(view.$el).toHaveClass('hidden');
  });

  it('should be visible when a new search is in progress', function () {
    view.setMediator(mediator);
    mediator.trigger('search:initiated');
    expect(view.$el).not.toHaveClass('hidden');
  });

  it('should be hidden when the data sets results are returned', function () {
    view.setMediator(mediator);
    mediator.trigger('search:initiated');

    mediator.trigger('search:fullSearchComplete');
    mediator.trigger('search:facetsReturned');

    expect(view.$el).toHaveClass('hidden');
  });

  it('should hide itself once the search is complete', function () {
    view.setMediator(mediator);
    mediator.trigger('search:initiated');

    mediator.trigger('search:fullSearchComplete');
    mediator.trigger('search:facetsReturned');

    expect(view.$el).toHaveClass('hidden');
  });

  it('should hide itself once the search is complete if the requests return in a different order', function () {
    view.setMediator(mediator);
    mediator.trigger('search:initiated');

    mediator.trigger('search:facetsReturned');
    mediator.trigger('search:fullSearchComplete');

    expect(view.$el).toHaveClass('hidden');
  });

  it('should display text indicating the search is in progress', function () {
    view.setMediator(mediator);
    mediator.trigger('search:initiated');
    expect(view.$('#loading-results-text').text()).toBe('Performing Search...');
  });

  it('should display text indicating the search is complete', function () {
    view.setMediator(mediator);
    mediator.trigger('search:success');
    expect(view.$('#loading-results-text').text()).toBe('Loading Results...');
  });

});
