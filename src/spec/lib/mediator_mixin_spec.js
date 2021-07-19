define(
  ['lib/mediator_mixin', 'lib/Mediator'],
  function (mediatorMixin, Mediator) {

    describe('Mediator Mixin', function () {
      describe('usage overview', function () {
        it('can be mixed in to an object', function () {
          var targetObject = {};
          _.extend(targetObject, mediatorMixin);
          expect(targetObject.mediatorTrigger instanceof Function).toBe(true);
        });

        it('can be mixed in to a class', function () {
          var targetObject,
          TargetClass = function () {};

          _.extend(TargetClass.prototype, mediatorMixin);
          targetObject = new TargetClass();

          expect(targetObject.mediatorTrigger instanceof Function).toBe(true);
        });

        it('provides a way for two objects to pass events to each other', function () {
          var sourceObject = _.extend({}, mediatorMixin),
              listenerObject = _.extend({}, mediatorMixin),
              eventHandler = sinon.stub();

          listenerObject.mediatorBind('ev', eventHandler);
          sourceObject.mediatorTrigger('ev', 'event data');

          expect(eventHandler).toHaveBeenCalledWithExactly('event data');
        });
      });

      describe('when a mediator is injected for testing', function () {
        var fakeMediator;

        beforeEach(function () {
          fakeMediator = { trigger: sinon.stub() };
        });

        afterEach(function () {});

        it('does not trigger events on the shared mediator', function () {
          var objectUnderTest = _.extend({}, mediatorMixin),
              independentObject = _.extend({}, mediatorMixin),
              independentObjectMediator = { trigger: sinon.stub() };

          independentObject.setMediator(independentObjectMediator);
          objectUnderTest.setMediator(fakeMediator);
          objectUnderTest.mediatorTrigger('event');

          expect(fakeMediator.trigger).toHaveBeenCalledWithExactly('event');
          expect(independentObjectMediator.trigger).not.toHaveBeenCalled();
        });

        it('triggers events on the injected mediator', function () {
          var targetObject = {};
          _.extend(targetObject, mediatorMixin);

          targetObject.setMediator(fakeMediator);
          targetObject.mediatorTrigger('someEvent', 'someData');

          expect(fakeMediator.trigger).toHaveBeenCalledWithExactly('someEvent', 'someData');
        });

        it('unbinds events bound to the shared mediator', function () {
          var objectWithInjectedMediator = _.extend({ callback: sinon.stub() }, mediatorMixin),
              independentObject = _.extend({ callback: sinon.stub() }, mediatorMixin),
              mediator = new Mediator();

          objectWithInjectedMediator.mediatorBind('ev', objectWithInjectedMediator.callback);
          independentObject.mediatorBind('ev', independentObject.callback);
          objectWithInjectedMediator.setMediator(mediator);

          independentObject.mediatorTrigger('ev');
          expect(independentObject.callback.mock.calls.length).toBe(1);
          expect(objectWithInjectedMediator.callback.mock.calls.length).toBe(0);
        });

        it('rebinds events bound to the shared mediator to the injected mediator', function () {
          var objectWithInjectedMediator = _.extend({ callback: sinon.stub() }, mediatorMixin),
              independentObject = _.extend({ callback: sinon.stub() }, mediatorMixin),
              mediator = new Mediator();

          objectWithInjectedMediator.mediatorBind('ev', objectWithInjectedMediator.callback);
          independentObject.mediatorBind('ev', independentObject.callback);
          objectWithInjectedMediator.setMediator(mediator);

          mediator.trigger('ev');
          expect(independentObject.callback.mock.calls.length).toBe(0);
          expect(objectWithInjectedMediator.callback.mock.calls.length).toBe(1);
        });
      });

      describe('when an injected mediator is reset to the shared mediator', function () {
        // TODO: xit('rebinds events bound to the injected mediator to the shared mediator', function () {});
        // TODO: xit('unbinds events bound to the injected mediator', function () {});
      });


      describe('event binding and unbinding internal details', function () {
        it('binds each event to the event object with _bind', function () {
          var mediator = { on: sinon.spy() },
              events = [['ev1', sinon.spy()],
                        ['ev2', sinon.spy(), {a: 1}]];

          mediatorMixin._bindEvents(mediator, events);

          expect(mediator.on).toHaveBeenCalledTwice();
          expect(mediator.on[0].length).toEqual(2);
          expect(mediator.on[1].length).toEqual(3);
        });

        it('unbinds each event from the event object with _unbind', function () {
          var mediator = { off: sinon.spy() },
              events = [['ev1', sinon.spy()],
                        ['ev2', sinon.spy(), {a: 1}]];

          mediatorMixin._unbindEvents(mediator, events);

          expect(mediator.off).toHaveBeenCalledTwice();
          expect(mediator.off[0].length).toEqual(2);
          expect(mediator.off[1].length).toEqual(3);
        });
      });

    });
  });

