define([], function () {

  var JSONFacets = function (init) {
    var facets = init.facets;

    this.getFacets = function () {
      return facets;
    };

    this.getFacet = function (id) {
      return _.find(facets, function (facet) {
        return facet.id === id;
      });
    };

    this.findFacetValue = function (facetCategory, name) {
      return _.find(facetCategory.values, function (value) {
        return value.fullName === name;
      });
    };

  };

  return JSONFacets;
});
