define([],
  function () {

    var openSearchOptions = {
      osdd: '/api/dataset/2/OpenSearchDescription',
      osSource: 'NSIDC',
      osStartIndex: 0,
      osItemsPerPage: 25,
      osSearchTerms: '',
      osAuthor: '',
      osParameter: '',
      osSensor: '',
      osTitle: '',
      osGeoBbox: '',
      osGeoBboxDisplay: '',
      osGeoRel: 'overlaps',
      osDtStart: '',
      osDtEnd: '',
      osRequestHeaders: [{name: 'X-Requested-With', value: 'NSIDC'}],
      osFacetFilters: {},
      osSortKeys: 'score,,desc'
    },

    config = {
      description: 'Config for NSIDC Search',
      openSearch: {
        defaultParameters: openSearchOptions
      },
      features: {

        // metrics
        crazyEggMetrics: false,

        // results header
        itemsPerPage: [25, 50, 100, 250, 500],

        // dropdown to sort results from the search results header
        //   key: sortKeys sent in OpenSearch query
        //   value: option displayed in dropdown on interface
        sortByOptions: {
          'score,,desc': 'Relevance (highest to lowest)',
          'spatial_area,,asc': 'Area (smallest to largest)',
          'spatial_area,,desc': 'Area (largest to smallest)',
          'temporal_duration,,asc': 'Duration (shortest to longest)',
          'temporal_duration,,desc': 'Duration (longest to shortest)',
          'updated,,desc': 'Last Updated (newest to oldest)'
        },

        // map thumbnail in results
        mapThumbnail: true,
        mapThumbnailBounds: [[-90, -180], [90, 180]],
        mapThumbnailShading: '/data/search/images/map/fill-pattern.png',
        mapPixelSize: 160,
        mapProjection: '4326',

        // facets
        facets: true,
        facetResetButton: true,
        itemsPerFacet: 11,
        scrollThreshold: 15,

        // reset link
        reset: 'home',

        // auto-suggest settings
        autoSuggestEnabled: true,

        // home page
        homePage: true,

        // search criteria, calendar widget
        useEdbDateRange: true
      },
      facetNames: {
        facet_sponsored_program: 'Program'
      }
    };
    return config;
  }
);
