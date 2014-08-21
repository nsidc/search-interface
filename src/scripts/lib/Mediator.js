define(
  [],
  function () {
    var Mediator = function () {};

    _.extend(Mediator.prototype, Backbone.Events);

    return Mediator;
  }
);
