import _ from 'underscore';

import Backbone from 'backbone';

var Mediator = function () {};

_.extend(Mediator.prototype, Backbone.Events);

export default Mediator;
