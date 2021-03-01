export const urls = {
    development: {
        openSearchHost: 'https://nsidc.org',
        port: 80
    },
    integration: {
        openSearchHost: 'https://integration.dss.apps.int.nsidc.org',
        port: 10680
    },
    production: {
        openSearchHost: 'https://nsidc.org/',
        port: 80
    },
};

// Values consistent across all environments
export const openSearchOptions = {
    osProvider: {},
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
    osSearchContentType: 'application/atom+xml',
    osFacetFilters: {},
    osFacetContentType: 'application/nsidc:facets+xml',
    osSortKeys: 'score,,desc'
};

export const appConfig = {
    description: 'Config for NSIDC Search',
    features: {
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

        // facets
        facets: true,
        facetResetButton: true,
        facetNames: {
            facet_sponsored_program: 'Program'
        },
        itemsPerFacet: 11,
        scrollThreshold: 15,

        // reset link
        reset: 'home',

        // auto-suggest settings
        autoSuggestEnabled: true,
        autoSuggestPath: '/api/dataset/2/suggest?q=%QUERY&source=',

        // home page
        homePage: true,

        // search criteria, calendar widget
        useEdbDateRange: true
    },

    detailsView: {
        map: {view: 'GLOBAL'},
        projections: {
            northView: true,
            southView: true,
            globalView: true
        }
    },

    searchCriteriaView: {
        searchButtonText: 'Search',
    },

    spatialCoverageTextView: {
        spatialText: 'N:90, S:-90, E:180, W:-180'
    },

    // map thumbnail in results
    spatialMetadataView: {
        mapThumbnail: true,
        mapThumbnailBounds: [[-90, -180], [90, 180]],
        mapThumbnailShading: 'images/map/fill-pattern.png',
        mapPixelSize: 160,
        mapProjection: '4326'
    },
};
