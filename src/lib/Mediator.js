import _ from 'underscore';

var Mediator = function () {};

_.extend(Mediator.prototype, Backbone.Events);

export default Mediator;
