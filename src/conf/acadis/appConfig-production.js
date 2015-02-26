define([],
  function () {

    var openSearchOptions = {
      osdd: '/api/dataset/2/OpenSearchDescription',
      osSource: 'ADE',
      osStartIndex: 0,
      osItemsPerPage: 25,
      osSearchTerms: '',
      osGeoBbox: '-180.0,45.0,180.0,90.0',
      osGeoBboxDisplay: 'N:90.0, S:45.0, E:180.0, W:-180.0',
      osGeoRel: 'overlaps',
      osDtStart: '',
      osDtEnd: '',
      osRequestHeaders: [{name: 'X-Requested-With', value: 'ADE'}],
      osFacetFilters: {},
      osSortKeys: 'score,,desc'
    },

    config = {
      description: 'Config for ACADIS ADE',
      openSearch: {
        defaultParameters: openSearchOptions
      },
      features: {

        // metrics
        crazyEggMetrics: true,

        // websockets
        wsService: '/api/notification',
        wsHostApp: 'ADE',

        // results header
        itemsPerPage: [10, 25, 50, 100],

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
        mapThumbnailBounds: [[0, -180], [90, 180]],
        mapThumbnailShading: 'default',
        mapPixelSize: 256,
        mapProjection: '3857',

        // facets
        facets: true,
        itemsPerFacet: 10,
        scrollThreshold: 15,

        // reset link
        reset: 'home',

        // auto-suggest settings
        autoSuggestEnabled: true,

        // home page
        homePage: true,
        homePageDataCenters: true,
        dynamicDatacenterCounts: true,

        // search criteria, calendar widget
        useEdbDateRange: false,

        // datacenters we (attempt to) harvest from; stored in array so we can
        // easily control the sorting (first item is displayed first, etc)
        //
        // - shortName: this must match the short name of the datacenter as
        //     stored in the facet_data_center fields in solr
        // - url: link to the datacenter's home page
        // - display: the name we want displayed on the home page, which may or
        //     may not match some combination of the  longName and shortName as
        //     stored in solr
        //
        expectedDataCenters: [
          {
            shortName: 'ACADIS Gateway',
            longName: 'Advanced Cooperative Arctic Data and Information Service',
            url: 'http://aoncadis.org'
          }, {
            shortName: 'NSIDC',
            longName: 'National Snow and Ice Data Center',
            url: 'http://nsidc.org'
          }, {
            shortName: 'UCAR/NCAR EOL',
            longName: 'UCAR/NCAR - Earth Observing Laboratory',
            url: 'http://data.eol.ucar.edu/codiac'
          }, {
            shortName: 'UCAR/NCAR RDA',
            longName: 'UCAR/NCAR Research Data Archive',
            url: 'http://rda.ucar.edu'
          }, {
            shortName: 'NOAA NODC',
            longName: 'NOAA National Oceanographic Data Center',
            url: 'http://www.nodc.noaa.gov/'
          }, {
            shortName: 'Met.no',
            longName: 'Norwegian Meteorological Institute',
            url: 'http://met.no'
          }, {
            shortName: 'NASA ECHO',
            longName: 'NASA Earth Observing System (EOS) Clearing House (ECHO)',
            url: 'https://earthdata.nasa.gov/echo'
          }, {
            shortName: 'ICES',
            longName: 'International Council for the Exploration of the Sea',
            url: 'http://ecosystemdata.ices.dk '
          }, {
            shortName: 'USGS ScienceBase',
            longName: 'U.S. Geological Survey ScienceBase',
            url: 'https://www.sciencebase.gov/catalog/'
          }, {
            shortName: 'BCO-DMO',
            longName: 'Biological and Chemical Oceanography Data Management Office',
            url: 'http://bco-dmo.org'
          }, {
            shortName: 'PDC',
            longName: 'Polar Data Catalogue',
            url: 'https://www.polardata.ca/'
          }, {
            shortName: 'tDAR',
            longName: 'The Digital Archaeological Record',
            url: 'http://www.tdar.org'
          }
        ]

      }
    };
    return config;
  }
);
