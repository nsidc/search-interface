import Mediator from "./Mediator";
import debug from "debug";

// All objects using this mixin have access to this shared mediator
var sharedMediator;
var mediatorMixin = {},
  initializeMediator;

// Initialize the single shared instance of a Mediator
if (!sharedMediator) {
  debug.log("Initializing mediator_mixin:sharedMediator");

  sharedMediator = new Mediator();
}

// Given a context (i.e. an object who with mediator_mixin),
// initialize its internal mediator if necessary
initializeMediator = function (context) {
  if (context._mediator === undefined) {
    mediatorMixin.resetMediator.apply(context);
  }

  if (context._events === undefined) {
    context._events = [];
  }
};

// Trigger an event on the mediator
mediatorMixin.mediatorTrigger = function () {
  initializeMediator(this);
  this._mediator.trigger.apply(this._mediator, arguments);
};

// Register interest in being notified when events on the mediator are raised
mediatorMixin.mediatorBind = function (event, callback, context) {
  initializeMediator(this);
  this._events.push(arguments);
  this._mediator.on(event, callback, context);
};

// Helper method to inject the mediator instance dependency, e.g. for testing
mediatorMixin.setMediator = function (mediator) {
  this._unbindEvents(this._mediator, this._events);
  this._mediator = mediator;
  this._bindEvents(this._mediator, this._events);
};

// Reset the mediator to the shared mediator
mediatorMixin.resetMediator = function () {
  this._mediator = sharedMediator;
};

mediatorMixin._bindEvents = function (mediator, events) {
  events.each(function (event) {
    mediator.on.apply(mediator, event);
  });
};

mediatorMixin._unbindEvents = function (mediator, events) {
  events.each(function (event) {
    mediator.off.apply(mediator, event);
  });
};

export default mediatorMixin;
