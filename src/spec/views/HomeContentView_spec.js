import HomeContentView from '../../views/HomeContentView';
import Mediator from '../../lib/Mediator.js';

describe('mediated event handling', function () {

    let homeContentView, mediator;

    beforeEach(function () {
        mediator = new Mediator();

        homeContentView = new HomeContentView({templateId: 'NSIDC', mediator: mediator});
        homeContentView.render();
    });

    it('is bound to the app:home event', function () {
        jest.spyOn(homeContentView, 'onAppHome');

        homeContentView.setMediator(mediator);

        mediator.trigger('app:home');
        expect(homeContentView.onAppHome).toHaveBeenCalled();
    });

    it('is hidden when a search is intiated', function () {
        mediator.trigger('search:initiated');
        expect(homeContentView.el).toHaveClass('hidden');
    });

    it('triggers a search when an example term is selected', function () {
        let event = {
            target: {
                text: 'sea ice'
            }
        };

        mediator = new Mediator();
        jest.spyOn(mediator, 'trigger').mockReturnValue({});
        homeContentView.setMediator(mediator);

        homeContentView.onClickExampleTerm(event);

        expect(mediator.trigger).toHaveBeenCalledWith('search:example', 'sea ice');
    });

    it('is visible after the app:home event', function () {
        homeContentView.hide();
        homeContentView.onAppHome();

        expect(homeContentView.el).not.toHaveClass('hidden');
    });
});
