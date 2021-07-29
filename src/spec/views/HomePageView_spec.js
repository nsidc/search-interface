import HomePageView from '../../views/HomePageView';
import NullView from '../../views/NullView';
import Mediator from '../../lib/Mediator';

var homePageView, mediator;

beforeEach(function () {
  homePageView = new HomePageView({templateId: 'ADE'});
  homePageView.render();

});

describe('mediated event handling', function () {

  beforeEach(function () {
    mediator = new Mediator();
    homePageView.setMediator(mediator);
  });

  it('is bound to the app:home event', function () {
    sinon.stub(homePageView, 'onAppHome');
    homePageView.bindEvents();

    mediator.trigger('app:home');
    expect(homePageView.onAppHome).toHaveBeenCalled();
  });

  it('is hidden when a search is intiated', function () {
    mediator.trigger('search:initiated');
    expect(homePageView.$el).toHaveClass('hidden');
  });

  it('triggers a search when an example term is selected', function () {
    mediator = new Mediator();
    sinon.stub(mediator, 'trigger');
    homePageView.setMediator(mediator);
    var event = {
      target: {
        text: 'sea ice'
      }
    };

    homePageView.onClickExampleTerm(event);

    expect(mediator.trigger).toHaveBeenCalledWith('search:example');
  });

});

it('is visible after the app:home event', function () {
  homePageView.hide();
  homePageView.onAppHome();
  expect(homePageView.$el).not.toHaveClass('hidden');
});
