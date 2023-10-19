import HomeContentView from '../../views/HomeContentView';
import Mediator from '../../lib/Mediator';

describe('mediated event handling', function () {

    let homeContentView, mediator;

    beforeEach(function () {
        mediator = new Mediator();

        homeContentView = new HomeContentView({templateId: 'NSIDC', mediator: mediator});
        homeContentView.render();
    });

    function rebindEvent(event, target) {
        mediator.off(event);
        mediator.on(event, target, homeContentView);
    };

    it('is bound to the app:home event', function () {
        let spy = jest.spyOn(homeContentView, 'onAppHome');

        rebindEvent('app:home', spy);

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

        let spy = jest.spyOn(mediator, 'trigger').mockReturnValue({});
        rebindEvent('search:example', spy);

        homeContentView.onClickExampleTerm(event);

        expect(mediator.trigger).toHaveBeenCalledWith('search:example', 'sea ice');
    });

    it('is visible after the app:home event', function () {
        homeContentView.hide();
        homeContentView.onAppHome();

        expect(homeContentView.el).not.toHaveClass('hidden');
    });
});
