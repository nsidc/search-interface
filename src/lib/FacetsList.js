define([], function () {

  var FacetsList = function (params) {
    var facets = params.facets;

    this.getFacets = function () {
      return facets;
    };
  };

  return FacetsList;
});
