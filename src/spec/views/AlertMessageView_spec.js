define(
  [
    'views/AlertMessageView',
    'lib/Mediator'
  ],
  function (AlertMessageView, Mediator) {

    describe('AlertMessageView', function () {
      var resultsCollection, view, mediator;

      beforeEach(function () {
        resultsCollection = new Backbone.Collection();
        mediator = new Mediator();
      });

      it('should initially be hidden', function () {
        view = new AlertMessageView().render();
        expect(view.$el.find('.alert')).toHaveClass('hidden');
      });

      it('should become visible when a new message arrives', function () {
        view = new AlertMessageView();
        view.setMediator(mediator);
        mediator.trigger('app:alert', {title: 'x', content: 'y'});
        expect(view.$el.find('.alert')).not.toHaveClass('hidden');
      });

      it('should close it when a user clicks the X', function () {
        view = new AlertMessageView().render();
        view.setMediator(mediator);
        view.removeAlertMessage();
        expect(view.$el.find('.alert')).toHaveClass('hidden');
      });

    });

  });
