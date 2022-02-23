import KeywordsView from '../../../views/search_criteria/KeywordsView';
import keywordsTemplate from '../../../text!templates/search_criteria/keywords.html';

describe('Keywords View', function () {
    var keywordsView;

    beforeEach(function () {
        var opts = {
            autoSuggestEnabled: false,
            keywordsTemplate: keywordsTemplate,
            source: 'NSIDC'
        };

        keywordsView = new KeywordsView(opts).render();
    });

    describe('rendering', function () {
        it('has a text input', function () {
            expect(keywordsView.$el.find('#keyword').length).toBe(1);
        });
    });

    describe('displaying searched-upon keywords back to the user', function () {
        it('shows a string just as it was', function () {
            expect(keywordsView.searchTermsAsString('one')).toEqual('one');
        });

        it('joins an array of strings with single spaces', function () {
            expect(keywordsView.searchTermsAsString(['one', 'two'])).toEqual('one two');
        });

        it('considers a multi-term string in the array as being a phrase search', function () {
            expect(keywordsView.searchTermsAsString(['one', 'two three'])).toEqual('one "two three"');
        });
    });

    describe('auto-suggest', function () {
        it('parses suggestions from the OpenSearch Suggestions response', function () {
            // http://www.opensearch.org/Specifications/OpenSearch/Extensions/Suggestions/1.1#Example_3
            var openSearchResponse = [
                    'sea',
                    [
                        'sea ice',
                        'sea ice concentration'
                    ],
                    [
                        'sea ice description',
                        'sea ice concentration description'
                    ],
                    [
                        'example.com/sea_ice_URL',
                        'example.com/sea_ice_concentration_URL'
                    ]
                ],
                parsedResponse = keywordsView.parseOpenSearchSuggestions(openSearchResponse);

            expect(parsedResponse).toEqual([
                { suggestion: 'sea ice' },
                { suggestion: 'sea ice concentration' }
            ]);

        });
    });

    describe('function to put search terms from input field into array', function () {

        beforeEach(function () {

            jasmine.addMatchers({
                toBePutInModelAs: function () {
                    return {
                        compare: function(actual, expected) {
                            var notText = this.isNot ? ' not' : '',
                                searchString = actual,
                                searchTermArray;

                            keywordsView.setInputField('keyword', searchString);
                            searchTermArray = keywordsView.getSearchTermArrayFromInput();

                            this.message = function () {
                                return 'Expected [' + searchTermArray + ']' + notText + ' to be [' + expected + ']';
                            };

                            return {pass: searchTermArray.join() === expected.join()};
                        }
                    };
                }
            });
        });

        // TODO [IT, 2013-06-03]: Many of the following tests aren't really unit tests - they go about three deep into other classes.
        it('handles quoted keyphrases as one term and unquoted keywords as separate terms', function () {
            expect('snow ice "polar bear"').toBePutInModelAs(['snow', 'ice', 'polar bear']);
        });

        it('handles a contraction as one term', function () {
            expect('don\'t').toBePutInModelAs(['don\'t']);
        });

        it('handles terms ending in an apostrophe', function () {
            expect('plural possessives\'').toBePutInModelAs(['plural', 'possessives\'']);
        });

        it('handles periods at the end of a term', function () {
            expect('Dr. Who').toBePutInModelAs(['Dr.', 'Who']);
        });

        it('handles periods and apostrophes together correctly', function () {
            expect('Dr. Stevens\' "snow and ice" data').toBePutInModelAs(['Dr.', 'Stevens\'', 'snow and ice', 'data']);
        });

        it('handles a single hyphenated term as one term', function () {
            expect('hyphenated-term').toBePutInModelAs(['hyphenated-term']);
        });

        it('handles hyphenated terms with non-hyphenated terms correctly', function () {
            expect('hyphenated-term snow ice hyphen-2').toBePutInModelAs(['hyphenated-term', 'snow', 'ice', 'hyphen-2']);
        });

        it('ignores bare commas and other non-alphanumeric characters', function () {
            expect(', ice : / \' snow -').toBePutInModelAs(['ice', 'snow']);
        });

        it('ignores unquoted commas', function () {
            expect('ignore, comma').toBePutInModelAs(['ignore', 'comma']);
        });

        it('captures quoted commas', function () {
            expect('do not "ignore, comma"').toBePutInModelAs(['do', 'not', 'ignore, comma']);
        });

        it('puts in commas, hyphens, and apostrophes when they are within quotes', function () {
            expect('"snow-test, don\'t-fail" ice, water').toBePutInModelAs(['snow-test, don\'t-fail', 'ice', 'water']);
        });

        it('handles weird combinations of hyphens and apostrophes', function () {
            expect('ice snow-fall\'s-there\'hi, what').toBePutInModelAs(['ice', 'snow-fall\'s-there\'hi', 'what']);
        });

        it('splits anything separated by commas not within quotes into separate terms', function () {
            expect('ic,icle snow').toBePutInModelAs(['ic', 'icle', 'snow']);
        });

        it('drops colons from copy-pasted titles', function () {
            expect('Shrubberies: desirable to knights').toBePutInModelAs(['Shrubberies', 'desirable', 'to', 'knights']);
        });

        it('handles slashes inside of parentheses', function () {
            expect('(Qeqertarsuaq/Godhavn)').toBePutInModelAs(['Qeqertarsuaq/Godhavn']);
        });
    });
});
