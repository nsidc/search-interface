define(['lib/mediator_mixin'], function (mediatorMixin) {

  var RequestProvider = function () {

    var currentRequest;

    this.holdRequest = function (xhr) {
      currentRequest = xhr;
    };

    this.abortSearchRequests = function () {
      // abort function with check readystate
      if (currentRequest && currentRequest.readystate !== 4) {
        currentRequest.abort();
        currentRequest = null;
      }
    };
  };

  _.extend(RequestProvider.prototype, mediatorMixin);
  return RequestProvider;
});
