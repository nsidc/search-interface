import Mediator from '../../lib/Mediator';
import SearchParamsModel from '../../models/SearchParamsModel';

jest.mock('../../lib/Mediator');

describe('SearchParamsModel', function () {
    var model, defaultParams, defaultBbox, mediatorStub;

    beforeEach(function () {
        defaultBbox = '-180,45,180,90';
        defaultParams = {
            osItemsPerPage: 25,
            osSearchTerms: '',
            osGeoBbox: defaultBbox,
            osDtStart: '',
            osDtEnd: '',
            osAuthor: '',
            osParameter: '',
            osSensor: '',
            osTitle: '',
            osFacetFilters: {}
        };

        model = new SearchParamsModel({
            mediator: new Mediator(),
            openSearchOptions: defaultParams
        });
    });

    describe('initialization', function () {
        it('sets the geoBoundingBox attribute with a default GeoBoundingBox', function () {
            expect(model.get('geoBoundingBox')).toBeDefined();
        });
    });

    describe('setting and removing a search term with a constraint', function () {
        it('sets a keyword with a contraint', function () {
            model.setKeywordAndConstraint('author', ['test', 'test2']);

            expect(model.get('author')).toEqual(['test', 'test2']);
        });

        it('throws an exception when the keywords are not passed as an array', function () {
            expect(function () { model.setKeywordAndConstraint('author', 'test'); }).toThrow(new TypeError('Keywords must be an array'));
        });

        it('removes one author from the set of authors', function () {
            model.setAuthor(['test', 'test2']);

            model.removeSearchTerm('test2');

            expect(model.get('author')).toEqual(['test']);
        });
    });

    describe('the items per page attribute', function () {
        it('converts string items per page to integers', function () {
            model.setItemsPerPage('50');

            expect(model.get('itemsPerPage')).toEqual(50);
        });
        //TODO [ML, 2013-06-17]: Add exception handling for invalid items per page

        it('sets the default items per page when none is given', function () {
            model.setItemsPerPage();

            expect(model.get('itemsPerPage')).toEqual(25);
        });

        it('changes the page number when items per page is increased so currently shown results are maintained', function () {
            model.setItemsPerPage('50');
            model.setPageNumber('5');

            model.setItemsPerPage('100');

            expect(model.get('pageNumber')).toEqual(3);
        });

        it('changes the page number when items per page is decreased so top of current shown results are maintained', function () {
            model.setItemsPerPage('100');
            model.setPageNumber('2');

            model.setItemsPerPage('25');

            expect(model.get('pageNumber')).toEqual(5);
        });

        it('does not change the page number when items per page is changed if the current page is 1', function () {
            model.setItemsPerPage('25');
            model.setPageNumber('1');

            model.setItemsPerPage('100');

            expect(model.get('pageNumber')).toEqual(1);
        });
    });

    describe('the page number attribute', function () {
        it('converts string page numbers to integers', function () {
            model.setPageNumber('4');

            expect(model.get('pageNumber')).toEqual(4);
        });

        it('truncates decimal page numbers', function () {
            model.setPageNumber(2.9);

            expect(model.get('pageNumber')).toEqual(2);
        });

        it('sets the page number to 1 if none is given', function () {
            model.setPageNumber();

            expect(model.get('pageNumber')).toEqual(1);
        });

        describe('handling invalid pageNumber values', function () {
            it('throws an error if a non-digit string is passed in', function () {
                expect(function () { model.setPageNumber('a'); }).toThrow(new Error('Requested page number must be a number'));
            });

            it('throws an error if the pageNumber is set to zero', function () {
                expect(function () { model.setPageNumber(0); }).toThrow(new Error('Requested page number must be greater than 0'));
            });

            it('throws an error if the pageNumber is set to a negative number', function () {
                expect(function () { model.setPageNumber(-1); }).toThrow(new Error('Requested page number must be greater than 0'));
            });
        });
    });

    describe('the facet filters attribute', function () {
        it('clears the facet filters', function () {
            model.set('facetFilters', { data_center: ['nsidc', 'cisl'] });

            model.resetFacetFilters();

            expect(model.get('facetFilters')).toEqual({});
        });

        it('clears a single facet\'s filters', function () {
            model.set('facetFilters', {data_center: ['nsidc'], animal: ['ice platypus', 'giant wombat']});
            model.clearFacet('animal');
            expect(model.get('facetFilters')).toEqual({data_center: ['nsidc']});
        });

        describe('toggleFacet function', function () {

            it('adds a new key to facetFilters when the key being toggled is not already present', function () {
                model.set('facetFilters', {});

                model.toggleFacet('data_center', 'nsidc');

                expect(model.get('facetFilters')).toEqual({
                    data_center: ['nsidc']
                });
            });

            it('adds a name to the filter list of an existing facet', function () {
                model.set('facetFilters', { data_center: ['nsidc'] });

                model.toggleFacet('data_center', 'cisl');

                expect(model.get('facetFilters')).toEqual({
                    data_center: ['nsidc', 'cisl']
                });
            });

            it('removes a name from the filter list of an existing facet', function () {
                model.set('facetFilters', { data_center: ['nsidc', 'cisl'] });

                model.toggleFacet('data_center', 'cisl');

                expect(model.get('facetFilters')).toEqual({
                    data_center: ['nsidc']
                });
            });

            it('triggers the search:refinedSearch event so that a search using the new facets can be executed', function () {
                model.toggleFacet('data_center', 'nsidc');

                expect(mediatorStub.trigger).toHaveBeenCalledWith('search:refinedSearch');
            });

            it('removes the facet from the filters if the list of values for that facet is empty', function () {
                model.set('facetFilters', { data_center: ['nsidc'] });

                model.toggleFacet('data_center', 'nsidc');

                expect(model.get('facetFilters')).toEqual({});
            });

            it('resets the starting page to 1 when facets are changed', function () {
                model.set('facetFilters', { data_center: ['nsidc'] });
                model.set('pageNumber', 3);

                model.toggleFacet('data_center', 'cisl');

                expect(model.get('pageNumber')).toEqual(1);
            });
        });
    });

    describe('changing attributes with the setCriteria method', function () {
        var geoBoundingBox = '1,2,3,4',
            criteria,
            filters = { 'facet_data_centers': ['nsidc'] };

        criteria = {
            keyword: ['test'],
            startDate: '2010-01-01',
            endDate: '2011-06-30',
            geoBoundingBox: geoBoundingBox,
            facetFilters: filters
        };

        // TODO: SKIPPED because of intermittent failures when running, need to investigate.
        xit('changes multiple search criteria', function () {
            model.setCriteria(criteria);

            expect(model.get('keyword')).toEqual(['test']);
            expect(model.get('startDate')).toEqual('2010-01-01');
            expect(model.get('endDate')).toEqual('2011-06-30');
            expect(model.get('geoBoundingBox')).toBe(geoBoundingBox);
            expect(model.get('facetFilters')).toBe(filters);
        });

        it('causes the page number to be reset to the first page', function () {
            model.setPageNumber(3);

            model.setCriteria(criteria);

            expect(model.get('pageNumber')).toEqual(1);
        });

        it('sets the title constraint to the keyword', function () {
            criteria = {
                title: ['test'],
                startDate: '2010-01-01',
                endDate: '2011-06-30',
                geoBoundingBox: geoBoundingBox
            };

            model.setCriteria(criteria);

            expect(model.get('title')).toEqual(['test']);
            expect(model.get('keyword')).toEqual('');
            expect(model.get('startDate')).toEqual('2010-01-01');
            expect(model.get('endDate')).toEqual('2011-06-30');
            expect(model.get('geoBoundingBox')).toBe(geoBoundingBox);
        });
    });

    describe('resetting parameters to their default state', function () {
        it('resets parameters to their default state', function () {
            var criteria = {
                keyword: ['test', 'test2'],
                author: ['test', 'author'],
                parameter: ['test', 'param'],
                sensor: ['test', 'sensor'],
                title: ['test', 'title'],
                startDate: '2010-01-01',
                endDate: '2011-06-30',
                geoBoundingBox: '-180,0,180,90'
            };

            model.setCriteria(criteria);
            model.resetCriteria();

            expect(model.get('pageNumber')).toEqual(1);
            expect(model.get('keyword')).toBe(defaultParams.osSearchTerms);
            expect(model.get('author')).toBe(defaultParams.osAuthor);
            expect(model.get('parameter')).toBe(defaultParams.osParameter);
            expect(model.get('sensor')).toBe(defaultParams.osSensor);
            expect(model.get('title')).toBe(defaultParams.osTitle);
            expect(model.get('startDate')).toBe(defaultParams.osDtStart);
            expect(model.get('endDate')).toBe(defaultParams.osDtEnd);
            expect(model.get('geoBoundingBox')).toBe(defaultParams.osGeoBbox);
        });

    });

    describe('resetting parameters to their initial state', function () {

        beforeEach(function () {
            var criteria = {
                keyword: ['test', 'test2'],
                author: ['test', 'author'],
                parameter: ['test', 'param'],
                sensor: ['test', 'sensor'],
                title: ['test', 'title'],
                startDate: '2010-01-01',
                endDate: '2011-06-30',
                geoBoundingBox: '-180,0,180,90'
            };

            model.setCriteria(criteria);
        });

        it('resets the keyword to nothing', function () {
            model.resetKeywords();

            expect(model.get('keyword')).toBe('');
        });

        it('resets the author to nothing', function () {
            model.resetAuthors();
            expect(model.get('author')).toBe('');
        });

        it('resets the parameter to nothing', function () {
            model.resetParameters();
            expect(model.get('parameter')).toBe('');
        });

        it('resets the sensor to nothing', function () {
            model.resetSensors();
            expect(model.get('sensor')).toBe('');
        });

        it('resets the title to nothing', function () {
            model.resetTitles();
            expect(model.get('title')).toBe('');
        });

        it('resets the coordinates to the initial setting', function () {
            model.resetSpatialCoverage();

            expect(model.get('geoBoundingBox')).toBe('-180,45,180,90');
        });

        it('resets the start and end dates to nothing', function () {
            model.resetTemporalCoverage();

            expect(model.get('startDate')).toBe('');
            expect(model.get('endDate')).toBe('');
        });

        it('resets all search parameters to their initial state', function () {
            model.resetCriteria();

            expect(model.get('pageNumber')).toEqual(1);
            expect(model.get('keyword')).toBe('');
            expect(model.get('author')).toBe('');
            expect(model.get('parameter')).toBe('');
            expect(model.get('sensor')).toBe('');
            expect(model.get('title')).toBe('');
            expect(model.get('geoBoundingBox')).toBe(defaultBbox);
            expect(model.get('startDate')).toBe('');
            expect(model.get('endDate')).toBe('');
        });
    });

    describe('initializing the default parameters', function () {
        it('sets the params from defaults when params are defined', function () {
            expect(model.get('keyword')).toBe('');
        });

        it('sets the keyword to empty string', function () {
            expect(model.get('keyword')).toBe('');
        });

        it('sets the author to empty string', function () {
            expect(model.get('author')).toBe('');
        });

        it('sets the parameter to empty string', function () {
            expect(model.get('parameter')).toBe('');
        });

        it('sets the sensor to empty string', function () {
            expect(model.get('sensor')).toBe('');
        });

        it('sets the title to empty string', function () {
            expect(model.get('title')).toBe('');
        });

        it('sets the start date to empty string', function () {
            expect(model.get('startDate')).toBe('');
        });

        it('sets the end date to empty string', function () {
            expect(model.get('endDate')).toBe('');
        });

        it('sets the geo bounding box to the default', function () {
            model.unset('geoBoundingBox');
            model.setParamsFromDefaultsIfNotSet();
            expect(model.get('geoBoundingBox')).toBe(defaultBbox);
        });

        it('sets the facet filters to an empty object', function () {
            model.unset('facetFilters');
            model.setParamsFromDefaultsIfNotSet();
            expect(model.get('facetFilters')).toEqual({});
        });

        describe('attributes that are already set', function () {

            it('does not overwrite the start date if it is already set', function () {
                model = new SearchParamsModel({mediator: new Mediator(), openSearchOptions: defaultParams, startDate: '2010-01-01'});
                model.setParamsFromDefaultsIfNotSet();
                expect(model.get('startDate')).toBe('2010-01-01');
            });

            it('does not overwrite the end date if it is already set', function () {
                model = new SearchParamsModel({mediator: new Mediator(), openSearchOptions: defaultParams, endDate: '2011-06-30'});
                model.setParamsFromDefaultsIfNotSet();
                expect(model.get('endDate')).toBe('2011-06-30');
            });

            it('does not overwrite keywords that are already set', function () {
                model = new SearchParamsModel({mediator: new Mediator(), openSearchOptions: defaultParams, keyword: 'ice'});
                model.setParamsFromDefaultsIfNotSet();
                expect(model.get('keyword')).toBe('ice');
            });

            it('does not overwrite the authors that are already set', function () {
                model = new SearchParamsModel({mediator: new Mediator(), openSearchOptions: defaultParams, author: 'testauthor'});
                model.setParamsFromDefaultsIfNotSet();
                expect(model.get('author')).toBe('testauthor');
            });

            it('does not overwrite the parameters that are already set', function () {
                model = new SearchParamsModel({mediator: new Mediator(), openSearchOptions: defaultParams, parameter: 'testparameter'});
                model.setParamsFromDefaultsIfNotSet();
                expect(model.get('parameter')).toBe('testparameter');
            });

            it('does not overwrite the sensors that are already set', function () {
                model = new SearchParamsModel({mediator: new Mediator(), openSearchOptions: defaultParams, sensor: 'testsensor'});
                model.setParamsFromDefaultsIfNotSet();
                expect(model.get('sensor')).toBe('testsensor');
            });

            it('does not overwrite the titles that are already set', function () {
                model = new SearchParamsModel({mediator: new Mediator(), openSearchOptions: defaultParams, title: 'testtitle'});
                model.setParamsFromDefaultsIfNotSet();
                expect(model.get('title')).toBe('testtitle');
            });

            it('does not overwrite the facet filters that are already set', function () {
                var filters = {'facet_data_centers': ['nsidc'] };

                model = new SearchParamsModel({
                    facetFilters: filters,
                    mediator: new Mediator(),
                    openSearchOptions: defaultParams,
                });
                model.setParamsFromDefaultsIfNotSet();
                expect(model.get('facetFilters')).toEqual(filters);
            });

        });
    });
});
