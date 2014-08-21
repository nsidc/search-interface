define(['lib/mediator_mixin'], function (mediatorMixin) {

  var FacetModel = Backbone.Model.extend({

    initialize: function () {
      var values = this.get('values');
      _.each(values, function (param) {
        param.selected = false;
      });
      this.bindEvents();
    },

    bindEvents: function () {
      this.mediatorBind('model:toggleFacet', this.toggleSelectedFacet, this);
      this.mediatorBind('model:clearSelectedFacet', this.clearFacetSelected, this);
    },

    clearFacetSelected: function (facet) {
      if (this.get('id') === facet) {
        var values = this.get('values');
        _.each(values, function (parm) {
            parm.selected = false;
          });
      }
    },

    toggleSelectedFacet: function (facet, value) {
      if (this.get('id') === facet) {
        var values = this.get('values');
        _.each(values, function (param) {
          if (param.fullName === value) {
            param.selected = !param.selected;
          }
        });
        this.set({'values': values});
      }
    },

    selected: function () {
      var selected = false;
      _.each(this.get('values'), function (value) {
        if (value.selected === true) {
          selected = true;
        }
      });
      return selected;
    }

  });

  _.extend(FacetModel.prototype, mediatorMixin);

  return FacetModel;
});
