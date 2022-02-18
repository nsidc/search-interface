import Backbone from 'backbone';

export default class Mediator {
    constructor() {
        Object.assign(this, Backbone.Events);
    }
}
