/* jshint esversion: 6 */

class RequestProvider {

    initialize() {
        this.currentRequest = null;
    }

    holdRequest(xhr) {
      this.currentRequest = xhr;
    }

    abortSearchRequests() {
      // abort function with check readystate
      if (this.currentRequest && this.currentRequest.readystate !== 4) {
        this.currentRequest.abort();
        this.currentRequest = null;
      }
    }
}

export default RequestProvider;
