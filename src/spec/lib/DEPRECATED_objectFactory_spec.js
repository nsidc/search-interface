import objectFactory from '../../lib/objectFactory';
import SearchParamsModel from '../../models/SearchParamsModel';
import SearchResultsCollection from '../../collections/SearchResultsCollection';

describe('The objectFactory object', function () {
  it('should get the initial dependency mappings from the config object', function () {
    var B = sinon.stub(),
        config = {'B': B};
        //config = appConfig;

    sinon.stub(objectFactory, 'register');

    // Act
    objectFactory.setConfig(config);

    // Assert
    expect(objectFactory.register.mock.calls.length).toEqual(1);
    expect(objectFactory.register).toHaveBeenCalledWith('B', B);

    objectFactory.register.restore();

  });

  it('should throw an exception when try to create an unregistered type', function () {
    var config = {dependencies: {'RegisteredType': sinon.stub()}};

    objectFactory.setConfig(config);

    expect(function () {
      objectFactory.createInstance('TypeNotRegistered');
    }).toThrow();
  });

  it('creates instances of the constructor function registered', function () {
    var Ctor = sinon.stub();
    objectFactory.register('Provider', Ctor);
    expect(objectFactory.createInstance('Provider') instanceof Ctor).toBe(true);
    expect(Ctor).toHaveBeenCalledOnce();
  });

  it('creates instances of the constructor function with option specified', function () {
    var options = { some: 'fake data' },
        FakeCtor = sinon.stub(),
        config;

    config = {
      RegisterdTypeWithOptions: {Ctor: FakeCtor}
    };

    objectFactory.setConfig(config);
    objectFactory.createInstance('RegisterdTypeWithOptions', options);

    expect(FakeCtor).toHaveBeenCalledOnce();
    expect(FakeCtor).toHaveBeenCalledWith(options);
  });

  it('create instances of the constructor function with the right option settings', function () {
    var options = { newoptions: 'newoptions'},
        FakeCtor = sinon.stub(),
        combinedOptions,
        config;

    config = {
      RegisterdTypeWithOptions: {Ctor: FakeCtor, configOptions: {defaultOptions: {defaultOptions: 'default'} } }
    };

    combinedOptions = _.extend({}, options, {defaults: {defaultOptions: 'default'} });

    objectFactory.setConfig(config);
    objectFactory.createInstance('RegisterdTypeWithOptions', options);

    expect(FakeCtor).toHaveBeenCalledOnce();
    expect(FakeCtor).toHaveBeenCalledWith(combinedOptions);
  });

  it('validate SearchParamsModel create properly', function () {
    var defaultBbox = '-180.0,45.0,180.0,90.0',
      searchParamsModel,
      config = {
        'SearchParamsModel': {
          Ctor: SearchParamsModel,
          configOptions: {
            defaultOptions : {
              osdd: '/api/gi-cat/services/opensearchesip?getDescriptionDocument',
              osStartIndex: 0,
              osItemsPerPage: 25,
              osSearchTerms: 'ice',
              osGeoBbox: '-180.0,45.0,180.0,90.0',
              osGeoBboxDisplay: 'N:90.0, S:-90.0, E:180.0, W:-180.0',
              osGeoRel: 'overlaps',
              osDtStart: '',
              osDtEnd: ''
            }
          }
        }
      };
    objectFactory.setConfig(config);
    searchParamsModel = objectFactory.createInstance('SearchParamsModel');

    expect(searchParamsModel.attributes.keyword).toBe('ice');
    expect(searchParamsModel.attributes.startDate).toBe('');
    expect(searchParamsModel.attributes.endDate).toBe('');
    expect(searchParamsModel.attributes.geoBoundingBox).toBe(defaultBbox);
  });

  it('create SearchResultsCollection instance with options', function () {
    var defaultBbox = '-180,45,180,90',
      searchResultsCollection, osProvider = {},
      config = {
        'SearchResultsCollection': {
          Ctor: SearchResultsCollection,
          configOptions : {
            preset: {
              osDefaultParameters: {
                osdd: '/api/gi-cat/services/opensearchesip?getDescriptionDocument',
                osStartIndex: 0,
                osItemsPerPage: 25,
                osSearchTerms: '',
                osGeoBbox: {latMax: 90, lonMax: 180, latMin: -10, lonMin: -180},
                osGeoRel: 'overlaps',
                osDtStart: '',
                osDtEnd: ''
              }
            }
          },
          models: {}
        }
      };
    objectFactory.setConfig(config);
    searchResultsCollection = objectFactory.createInstance('SearchResultsCollection', {
      provider: osProvider, geoBoundingBox: defaultBbox
    });

    expect(searchResultsCollection.getSouth()).toBe(parseFloat(defaultBbox.split(',')[1], 10));
    expect(searchResultsCollection.provider).toBe(osProvider);
  });

  it('throws error on SearchResultsCollection instance missing osdd params', function () {
    var searchResultsCollection,
      config = {
        'SearchResultsCollection': {
          Ctor: SearchResultsCollection,
          configOptions: {
            preset: {
              osDefaultParameters: {
                osStartIndex: 0,
                osItemsPerPage: 25,
                osSearchTerms: '',
                osGeoBbox: {latMax: 90, lonMax: 180, latMin: -10, lonMin: -180},
                osGeoRel: 'overlaps',
                osDtStart: '',
                osDtEnd: ''
              }
            }
          },
          models: {}
        }
      };
    objectFactory.setConfig(config);
    expect(function () {
      searchResultsCollection = objectFactory.createInstance('SearchResultsCollection', {
        models: ['test'], el: document.createElement('div')
      });
    }).toThrow(new Error('undefined OSDD URL value in configuration'));
  });
});
