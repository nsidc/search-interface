import HomeContentView from '../../views/HomeContentView';
import Mediator from '../../lib/Mediator';
import {rebindEvent} from "../rebindEvents.js";

describe('mediated event handling', function () {

    let homeContentView, mediator;

    beforeEach(function () {
        mediator = new Mediator();

        homeContentView = new HomeContentView({templateId: 'NSIDC', mediator: mediator});
        homeContentView.render();
    });

    it('is bound to the app:home event', function () {
        let spy = jest.spyOn(homeContentView, 'onAppHome');

        rebindEvent(mediator, 'app:home', spy, homeContentView);

        mediator.trigger('app:home');
        expect(homeContentView.onAppHome).toHaveBeenCalled();
    });

    it('is hidden when a search is intiated', function () {
        mediator.trigger('search:initiated');
        expect(homeContentView.el).toHaveClass('hidden');
    });

    it('is visible after the app:home event', function () {
        homeContentView.hide();
        homeContentView.onAppHome();

        expect(homeContentView.el).not.toHaveClass('hidden');
    });
});
