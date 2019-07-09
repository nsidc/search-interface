define(['views/result_item/DetailsTableView',
        'views/AlertMessageView',
        'views/MainHeaderView',
        'views/HomePageView',
        'views/LoadingResultsView',
        'views/NoResultsView',
        'views/SearchErrorView',
        'views/AdeMainView',
        'views/right_column/RightColumnView',
        'views/right_column/SearchResultsView',
        'views/right_column/results_footer/ResultsFooterView',
        'views/right_column/results_footer/PaginationControlsView',
        'views/right_column/results_header/ResultsHeaderView',
        'views/right_column/results_header/ResultsPerPageView',
        'views/right_column/results_header/SortResultsView',
        'views/left_column/FacetsView',
        'views/left_column/FacetView',
        'views/left_column/LeftColumnView',
        'views/left_column/LogoView',
        'views/result_item/NsidcResultItemView',
        'views/result_item/GetDataButtonView',
        'views/result_item/NsidcDataFormatView',
        'views/result_item/NsidcParametersView',
        'views/result_item/NsidcSummaryView',
        'views/result_item/NsidcSupportingProgramsView',
        'views/result_item/NsidcTemporalMetadataView',
        'views/result_item/SpatialMetadataView',
        'views/search_criteria/SearchCriteriaView',
        'views/search_criteria/TemporalCoverageView',
        'views/search_criteria/SpatialCoverageView',
        'views/search_criteria/NsidcSpatialCoverageTextView',
        'views/search_criteria/KeywordsView',
        'views/search_criteria/SpatialCoverageCompassView',
        'models/SearchParamsModel',
        'lib/OpenSearchProvider',
        'lib/FacetsResponse',
        'appConfig',
        'collections/SearchResultsCollection',
        'collections/FacetsCollection'],
  function (DetailsTableView,
            AlertMessageView,
            MainHeaderView,
            HomePageView,
            LoadingResultsView,
            NoResultsView,
            SearchErrorView,
            AdeMainView,
            RightColumnView,
            SearchResultsView,
            ResultsFooterView,
            PaginationControlsView,
            ResultsHeaderView,
            ResultsPerPageView,
            SortResultsView,
            FacetsView,
            FacetView,
            LeftColumnView,
            LogoView,
            NsidcResultItemView,
            GetDataButtonView,
            DataFormatView,
            ParametersView,
            SummaryView,
            SupportingProgramsView,
            TemporalMetadataView,
            SpatialMetadataView,
            SearchCriteriaView,
            TemporalCoverageView,
            SpatialCoverageView,
            NsidcSpatialCoverageTextView,
            KeywordsView,
            SpatialCoverageCompassView,
            SearchParamsModel,
            OpenSearchProvider,
            FacetsResponse,
            appConfig,
            SearchResultsCollection,
            FacetsCollection) {

    var openSearchOptions = appConfig.openSearch.defaultParameters,
        homePageEnabled = appConfig.features.homePage,
        facetsEnabled = appConfig.features.facets,
        facetNameMap = appConfig.facetNames,
        itemsPerFacet = appConfig.features.itemsPerFacet,
        itemsPerPage = appConfig.features.itemsPerPage,
        mapThumbnailEnabled = appConfig.features.mapThumbnail,
        thumbnailBounds = appConfig.features.mapThumbnailBounds,
        mapProjection = appConfig.features.mapProjection,
        mapPixelSize = appConfig.features.mapPixelSize,
        reset = appConfig.features.reset,
        facetResetButton = appConfig.features.facetResetButton,
        mapThumbnailShading = appConfig.features.mapThumbnailShading,
        autoSuggestEnabled = appConfig.features.autoSuggestEnabled,
        scrollThreshold = appConfig.features.scrollThreshold,
        sortByOptions = appConfig.features.sortByOptions,
        useEdbDateRange  = appConfig.features.useEdbDateRange,

    dependencies = {
      'DetailsView': DetailsTableView,
      'AlertMessageView': AlertMessageView,
      'MainHeaderView': {
        Ctor: MainHeaderView,
        configOptions: {
          preset: {
            templateId: 'NSIDC',
            map: {view : 'GLOBAL'},
            features: {
              homePage: homePageEnabled,
              projections: {
                northView: true,
                southView: true,
                globalView: true
              }
            }
          }
        }
      },
      'SearchCriteriaView': {Ctor: SearchCriteriaView, configOptions: {preset: {searchButtonText: 'Search', reset: reset}}},
      'AdeMainView': {Ctor: AdeMainView},
      'RightColumnView': {Ctor: RightColumnView},
      'SpatialCoverageTextView': {Ctor: NsidcSpatialCoverageTextView, configOptions: {preset: {presetText: 'N:90, S:-90, E:180, W:-180'}}},
      'HomePageView': {Ctor: HomePageView, configOptions: {preset: {templateId: 'NSIDC'} } },
      'LeftColumnView': {Ctor: LeftColumnView, configOptions: {preset: {homePage: homePageEnabled, facets: facetsEnabled} } },
      'GetDataButtonView': {
        Ctor: GetDataButtonView,
        configOptions: {
          preset: {
            urlField: 'dataUrl',
            buttonTemplate: 'nsidcHasUrl'
          }
        }
      },
      'DataFormatView': DataFormatView,
      'ParametersView': ParametersView,
      'SummaryView': SummaryView,
      'SupportingProgramsView': SupportingProgramsView,
      'SpatialMetadataView': SpatialMetadataView,
      'TemporalMetadataView': TemporalMetadataView,
      'SearchResultsView': SearchResultsView,
      'ResultsFooterView': ResultsFooterView,
      'PaginationControlsView': {
        Ctor: PaginationControlsView
      },
      'ResultsPerPageView': {
        Ctor: ResultsPerPageView,
        configOptions: {preset: {features: {resultsPerPage: itemsPerPage } } }
      },
      'LogoView': {Ctor: LogoView, configOptions: {preset: {templateId: 'NSIDC' } } },
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
      'FacetView': {
        Ctor: FacetView,
        configOptions: {
          preset: {
            itemsPerFacet: itemsPerFacet,
            facetResetButton: facetResetButton,
            scrollThreshold: scrollThreshold
          }
        }
      },
      'ResultItemView': {
        Ctor: NsidcResultItemView,
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
      'NoResultsView': NoResultsView,
      'SearchErrorView': {Ctor: SearchErrorView},
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
      },
      'SpatialCoverageCompassView': SpatialCoverageCompassView
    };
    return dependencies;
  }
);
