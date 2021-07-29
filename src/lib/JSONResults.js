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
var JSONResults = function (init) {
  var results = init.results,
    totalCount = init.totalCount,
    firstPageLink = init.firstPageLink,
    previousPageLink = init.previousPageLink,
    nextPageLink = init.nextPageLink,
    lastPageLink = init.lastPageLink,
    currentIndex = init.currentIndex,
    itemsPerPage = init.itemsPerPage,
    keyword = init.keyword,
    authorTerms = init.authorTerms,
    parameterTerms = init.parameterTerms,
    sensorTerms = init.sensorTerms,
    titleTerms = init.titleTerms,
    startDate = init.startDate,
    endDate = init.endDate,
    sortKeys = init.sortKeys,
    geoBoundingBox = init.geoBoundingBox,
    facetFilters = init.facetFilters;

  this.getResults = function () {
    return results;
  };

  this.getGeoBoundingBox = function () {
    return geoBoundingBox;
  };

  this.getTotalCount = function () {
    return totalCount;
  };

  this.getCurrentIndex = function () {
    return currentIndex;
  };

  this.getItemsPerPage = function () {
    return itemsPerPage;
  };

  this.getFirstPageLink = function () {
    return firstPageLink;
  };

  this.getPreviousPageLink = function () {
    return previousPageLink;
  };

  this.getNextPageLink = function () {
    return nextPageLink;
  };
  this.getLastPageLink = function () {
    return lastPageLink;
  };

  this.getKeyword = function () {
    return keyword;
  };

  this.getAuthorTerms = function () {
    return authorTerms;
  };

  this.getParameterTerms = function () {
    return parameterTerms;
  };

  this.getSensorTerms = function () {
    return sensorTerms;
  };

  this.getTitleTerms = function () {
    return titleTerms;
  };

  this.getStartDate = function () {
    return startDate;
  };

  this.getEndDate = function () {
    return endDate;
  };

  this.getSortKeys = function () {
    return sortKeys;
  };

  this.getFacetFilters = function () {
    return facetFilters;
  };
};

return JSONResults;
