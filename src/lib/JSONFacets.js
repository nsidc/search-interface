import _ from "underscore";

class JSONFacets {
    constructor(init) {
        this.facets = init.facets;
    }

    getFacets() {
        return this.facets;
    }

    getFacet(id) {
        return _.find(this.facets, function (facet) {
            return facet.id === id;
        });
    }

    findFacetValue(facetCategory, name) {
        return _.find(facetCategory.values, function (value) {
            return value.fullName === name;
        });
    }
}

export default JSONFacets;
