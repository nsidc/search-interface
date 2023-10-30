export function rebindEvent(mediator, event, target, object) {
  mediator.off(event);
  mediator.on(event, target, object);
}
