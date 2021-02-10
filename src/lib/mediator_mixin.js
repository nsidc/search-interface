// All objects using this mixin have access to this shared mediator
var sharedMediator;

define(
  [
    'lib/Mediator',
    'vendor/debug'
  ],
  // TODO [IT 2013-05-09]: Why is the reference to the debug library null?
  function (Mediator) {
    var mixin = {},
        initializeMediator;

    // Initialize the single shared instance of a Mediator
    if (!sharedMediator) {
      debug.log('Initializing mediator_mixin:sharedMediator');
      sharedMediator = new Mediator();
    }

    // Given a context (i.e. an object who with mediator_mixin),
    // initialize its internal mediator if necessary
    initializeMediator = function (context) {
      if (context._mediator === undefined) {
        mixin.resetMediator.apply(context);
      }

      if (context._events === undefined) {
        context._events = [];
      }
    };

    // Trigger an event on the mediator
    mixin.mediatorTrigger = function () {
      initializeMediator(this);
      this._mediator.trigger.apply(this._mediator, arguments);
    };

    // Register interest in being notified when events on the mediator are raised
    mixin.mediatorBind = function (event, callback, context) {
      initializeMediator(this);
      this._events.push(arguments);
      this._mediator.on(event, callback, context);
    };

    // Helper method to inject the mediator instance dependency, e.g. for testing
    mixin.setMediator = function (mediator) {
      this._unbindEvents(this._mediator, this._events);
      this._mediator = mediator;
      this._bindEvents(this._mediator, this._events);
    };

    // Reset he mediator to the shared mediator
    mixin.resetMediator = function () {
      this._mediator = sharedMediator;
    };

    mixin._bindEvents = function (mediator, events) {
      _(events).each(function (event) {
        mediator.on.apply(mediator, event);
      });
    };

    mixin._unbindEvents = function (mediator, events) {
      _(events).each(function (event) {
        mediator.off.apply(mediator, event);
      });
    };

    return mixin;
  }
);
