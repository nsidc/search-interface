define([
  'vendor/requirejs/text!templates/live_data_center.html',
  'vendor/requirejs/text!templates/data_center_unavailable.html',
  'vendor/requirejs/text!templates/data_center_count.html',
  'lib/mediator_mixin'
],
       function (
         liveDatacenterTemplate,
         unavailableTemplate,
         count,
         mediatorMixin
       ) {

  var templates, LiveDataCentersView, idRegex;

  templates = {
    liveDatacenter: _.template(liveDatacenterTemplate),
    unavailable: _.template(unavailableTemplate),
    count: _.template(count)
  };

  // compile the regex just once
  // characters that cannot be in HTML ids but are in the datacenter short names
  idRegex = /[\s\.\/]/g;

  LiveDataCentersView = Backbone.View.extend({

    events: {
      'click li .count a': 'searchByCounts'
    },

    initialize: function (options) {
      this.options = options;
      this.mediatorBind('app:home', this.onAppHome, this);
      this.mediatorBind('search:datacentersReturned', this.onDatacentersReturned, this);
    },

    onAppHome: function () {
      this.mediatorTrigger('search:datacentersOnly', this.model);
    },

    // display list of data centers (with links) from which we harvest
    // fill in counts to initially be 0
    render: function () {
      _.each(this.options.expectedDataCenters, function (datacenter) {
        this.$el.append(templates.liveDatacenter({
          display: datacenter.display,
          shortName: datacenter.shortName,
          longName: datacenter.longName,
          id: datacenter.shortName.replace(idRegex, ''),
          url: datacenter.url
        }));

        if (this.options.dynamicDatacenterCounts) {
          this.getCountElement(datacenter).html(templates.unavailable);
        }

      }, this);

    },

    // find the span containing the number of records for the given datacenter
    getCountElement: function (datacenter) {
      var id = 'count-' + datacenter.shortName.replace(idRegex, ''),
          countSelector = '#' + id + ' > .count',
          countElement = this.$el.find(countSelector);

      return countElement;
    },

    // update the counts
    onDatacentersReturned: function (datacenters) {
      if (this.options.dynamicDatacenterCounts) {
        _.each(datacenters.values, function (datacenter) {
          var countElement = this.getCountElement(datacenter);
          countElement.empty();
          if (datacenter.count !== '0') {
            countElement.html(templates.count({
              count: datacenter.count
            }));
          }
        }, this);
      }
    },

    // click on the 'X records' link should search and filter by that associated
    // data center so that the X records are the results
    searchByCounts: function (event) {
      var fullDatacenterName, li;

      li = $(event.target).closest('li');

      // get the 'full name' matching the format the facet model expects
      fullDatacenterName = li.find('.longName').text() + ' | ' + li.find('.shortName').text();

      this.mediatorTrigger('model:toggleFacet', 'facet_data_center', fullDatacenterName);
      this.mediatorTrigger('search:initiated', this.model);
    }

  });

  _.extend(LiveDataCentersView.prototype, mediatorMixin);

  return LiveDataCentersView;
});
