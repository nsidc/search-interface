/** An class used to pass JSON Results from a request.
*  parameters:
*    - init: An object containing the following key/value pairs:
*              - results: An array of objects, each containing the following keys:
*                           - title: the title of the result entry
*                           - dataUrl: a link that points to the data
*                           - geoBoundingBox: a valid GeoBoundingBox object
*                           - dtstart : start date for temporal coverage.
*                           - dtend : end date for temporal coverage.
*                           - summary : the summary of the result entry
*    - totalCount: The total number of results for the query
*    - firstPageLink : url to the first page
*    - previousPageLink : url to the previous page
*    - nextPageLink : url to the next page
*    - lastPageLink : url to the last page
*    - currentIndex : the index of the first entry for this feed (should usually be p*n+1, p=page, n=# per page)
*    - itemsPerPage : number of result entries on a page of results
*    - keyword : the keyword(s) used to create this result set
*/
export default class JSONResults {
    constructor(init) {
        this.results = init?.results,
        this.totalCount = init?.totalCount,
        this.firstPageLink = init?.firstPageLink,
        this.previousPageLink = init?.previousPageLink,
        this.nextPageLink = init?.nextPageLink,
        this.lastPageLink = init?.lastPageLink,
        this.currentIndex = init?.currentIndex,
        this.itemsPerPage = init?.itemsPerPage,
        this.keyword = init?.keyword,
        this.authorTerms = init?.authorTerms,
        this.parameterTerms = init?.parameterTerms,
        this.sensorTerms = init?.sensorTerms,
        this.titleTerms = init?.titleTerms,
        this.startDate = init?.startDate,
        this.endDate = init?.endDate,
        this.sortKeys = init?.sortKeys,
        this.geoBoundingBox = init?.geoBoundingBox,
        this.facetFilters = init?.facetFilters;
    }

    getResults() {
        return this.results;
    }

    getGeoBoundingBox() {
        return this.geoBoundingBox;
    }

    getTotalCount() {
        return this.totalCount;
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    getItemsPerPage() {
        return this.itemsPerPage;
    }

    getFirstPageLink() {
        return this.firstPageLink;
    }

    getPreviousPageLink() {
        return this.previousPageLink;
    }

    getNextPageLink() {
        return this.nextPageLink;
    }
    getLastPageLink() {
        return this.lastPageLink;
    }

    getKeyword() {
        return this.keyword;
    }

    getAuthorTerms() {
        return this.authorTerms;
    }

    getParameterTerms() {
        return this.parameterTerms;
    }

    getSensorTerms() {
        return this.sensorTerms;
    }

    getTitleTerms() {
        return this.titleTerms;
    }

    getStartDate() {
        return this.startDate;
    }

    getEndDate() {
        return this.endDate;
    }

    getSortKeys() {
        return this.sortKeys;
    }

    getFacetFilters() {
        return this.facetFilters;
    }
}
