define(['views/result_item/SummaryView',
        'views/HomePageView',
        'views/right_column/results_footer/PaginationControlsView',
        'views/right_column/results_header/ResultsHeaderView',
        'views/right_column/results_header/ResultsPerPageView',
        'views/right_column/results_header/SortResultsView',
        'views/MainHeaderView',
        'views/LoadingResultsView',
        'views/LiveDataCentersView',
        'views/left_column/FacetsView',
        'views/left_column/FacetView',
        'views/left_column/LeftColumnView',
        'views/left_column/LogoView',
        'views/result_item/ResultItemView',
        'views/result_item/GetDataButtonView',
        'views/search_criteria/SearchCriteriaView',
        'views/search_criteria/TemporalCoverageView',
        'views/search_criteria/SpatialCoverageView',
        'views/search_criteria/AcadisSpatialCoverageTextView',
        'views/search_criteria/KeywordsView',
        'models/SearchParamsModel',
        'lib/OpenSearchProvider',
        'lib/FacetsResponse',
        'appConfig',
        'collections/SearchResultsCollection',
        'collections/FacetsCollection'],
  function (SummaryView,
      HomePageView,
      PaginationControlsView,
      ResultsHeaderView,
      ResultsPerPageView,
      SortResultsView,
      MainHeaderView,
      LoadingResultsView,
      LiveDataCentersView,
      FacetsView,
      FacetView,
      LeftColumnView,
      LogoView,
      ResultItemView,
      GetDataButtonView,
      SearchCriteriaView,
      TemporalCoverageView,
      SpatialCoverageView,
      AcadisSpatialCoverageTextView,
      KeywordsView,
      SearchParamsModel,
      OpenSearchProvider,
      FacetsResponse,
      appConfig,
      SearchResultsCollection,
      FacetsCollection) {

    var openSearchOptions = appConfig.openSearch.defaultParameters,
        homePageEnabled = appConfig.features.homePage,
        dynamicDatacenterCounts = appConfig.features.dynamicDatacenterCounts,
        facetsEnabled = appConfig.features.facets,
        facetNameMap = appConfig.facetNames,
        itemsPerFacet = appConfig.features.itemsPerFacet,
        itemsPerPage = appConfig.features.itemsPerPage,
        mapThumbnailEnabled = appConfig.features.mapThumbnail,
        thumbnailBounds = appConfig.features.mapThumbnailBounds,
        mapProjection = appConfig.features.mapProjection,
        mapPixelSize = appConfig.features.mapPixelSize,
        reset = appConfig.features.reset,
        expectedDataCenters = appConfig.features.expectedDataCenters,
        homePageDataCenters = appConfig.features.homePageDataCenters,
        mapThumbnailShading = appConfig.features.mapThumbnailShading,
        autoSuggestEnabled = appConfig.features.autoSuggestEnabled,
        scrollThreshold = appConfig.features.scrollThreshold,
        sortByOptions = appConfig.features.sortByOptions,
        useEdbDateRange = appConfig.features.useEdbDateRange,

    dependencies = {
      'DetailsView': SummaryView,
      'MainHeaderView': {
        Ctor: MainHeaderView,
        configOptions: {
          preset: {
            templateId: 'ACADIS',
            map: {view : 'EASE_GRID_NORTH'},
            features: {
              homePage: homePageEnabled,
              projections: {
                northView: true,
                southView: false,
                globalView: true
              }
            }
          }
        }
      },
      'SearchCriteriaView': {
        Ctor: SearchCriteriaView,
        configOptions: {
          preset: {
            searchButtonText: 'Find Data Now',
            reset: reset
          }
        }
      },
      'SpatialCoverageTextView': AcadisSpatialCoverageTextView,

      'HomePageView': {
        Ctor: HomePageView,
        configOptions: {
          preset: {
            homePageDataCenters: homePageDataCenters,
            templateId: 'ACADIS'
          }
        }
      },

      'LiveDataCentersView': {
        Ctor: LiveDataCentersView,
        configOptions: {
          preset: {
            dynamicDatacenterCounts: dynamicDatacenterCounts,
            expectedDataCenters: expectedDataCenters
          }
        }
      },

      'LeftColumnView': {Ctor: LeftColumnView, configOptions: {preset: {homePage: homePageEnabled, facets: facetsEnabled } } },
      'GetDataButtonView': {
        Ctor: GetDataButtonView,
        configOptions: {
          preset: {
            urlField: 'catalogUrl'
          }
        }
      },
      'PaginationControlsView': {
        Ctor: PaginationControlsView
      },
      'ResultsPerPageView': {
        Ctor: ResultsPerPageView,
        configOptions: {preset: {features: {resultsPerPage: itemsPerPage } } }
      },
      'LogoView': {Ctor: LogoView, configOptions: {preset: {templateId: 'ACADIS' } } },
      'FacetsView': { Ctor: FacetsView, configOptions: {preset: {itemsPerFacet: itemsPerFacet } } },
      'SearchParamsModel': {
        Ctor: SearchParamsModel,
        configOptions: {
          defaultOptions: openSearchOptions
        }
      },
      'SearchResultsCollection': {
        Ctor: SearchResultsCollection,
        configOptions: {
          preset: {
            osDefaultParameters: openSearchOptions
          }
        },
        models: {}
      },
      'FacetsCollection': {
        Ctor: FacetsCollection,
        configOptions: {
          preset: {
            osDefaultParameters: openSearchOptions,
            facetsEnabled: facetsEnabled
          }
        },
        models: {}
      },
      'ResultItemView': {
        Ctor: ResultItemView,
        configOptions: {
          preset: {
            mapThumbnail: mapThumbnailEnabled,
            thumbnailBounds: thumbnailBounds,
            mapThumbnailShading: mapThumbnailShading,
            mapPixelSize: mapPixelSize,
            mapProjection: mapProjection
          }
        }
      },
      'FacetView' : {
        Ctor: FacetView,
        configOptions: {
          preset: {
            itemsPerFacet: itemsPerFacet,
            scrollThreshold: scrollThreshold
          }
        }
      },
      'KeywordsView': {
        Ctor: KeywordsView,
        configOptions: {
          preset: {
            autoSuggestEnabled: autoSuggestEnabled,
            source: openSearchOptions.osSource
          }
        }
      },
      'TemporalCoverageView': {
        Ctor: TemporalCoverageView,
        configOptions: {
          preset: {
            useEdbDateRange: useEdbDateRange
          }
        }
      },
      'SpatialCoverageView': SpatialCoverageView,
      'LoadingResultsView': {
        Ctor: LoadingResultsView,
        configOptions: {
          preset: {
            facetsEnabled: facetsEnabled
          }
        }
      },
      'OpenSearchProvider': OpenSearchProvider,
      'FacetsResponse': {Ctor: FacetsResponse, configOptions: {preset: {nameMap: facetNameMap } } },
      'ResultsHeaderView': ResultsHeaderView,
      'SortResultsView': {
        Ctor: SortResultsView,
        configOptions: {
          preset: {
            sortByOptions: sortByOptions
          }
        }
      }
    };
    return dependencies;
  }
);
