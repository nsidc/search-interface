import OpenSearchProvider from '../../lib/OpenSearchProvider';
import FacetsResponse from '../../lib/FacetsResponse';

describe('OpenSearchProvider', function () {
    var JqXhrBuilder = function (response) {
        var jqXhr = {};
        jqXhr.readystate = response.state;
        jqXhr.responseHeaders = response.responseHeaders ||
      {'Content-type': response.contentType || 'application/json' };
        jqXhr.abort = sinon.stub();
        return jqXhr;
    };

    describe('OpenSearch requests', function () {
        var queryStub;

        beforeEach(function () {
            queryStub = sinon.stub(OpenSearchlight, 'query');
        });

        afterEach(function () {
            OpenSearchlight.query.restore();
        });

        it('should invoke query with specified parameters', function () {
            var options = {
                    osParameters: {
                        osSource: 'NSIDC',
                        osStartIndex: 1,
                        osItemsPerPage: 1,
                        osSearchTerms: ['sea', 'ice'],
                        geoBoundingBox: '10,20,30,40',
                        osDtStart: '2011-01-01',
                        osDtEnd: '2012-01-01',
                        osFacetFilters: {'facet_name': ['facet_val']}
                    }
                },
                provider = new OpenSearchProvider();

            provider.queryOpenSearch(options);
            expect(queryStub).toHaveBeenCalled();
            expect(queryStub.getCall(0)[0].parameters).toEqual({
                searchTerms: 'sea%20ice',
                'nsidc:title': '',
                'nsidc:parameters': '',
                'nsidc:sensors': '',
                'nsidc:authors': '',
                startIndex: 1,
                count: 1,
                'geo:box': '10,20,30,40',
                'geo:relation': undefined,
                'time:start': '2011-01-01',
                'time:end': '2012-01-01',
                'nsidc:source': 'NSIDC',
                'nsidc:facetFilters': encodeURIComponent(JSON.stringify({'facet_name': ['facet_val']})),
                sortKeys: undefined
            });
        });

        it('should invoke query with empty parameters', function () {
            var options = {
                    osParameters: {
                        osSource: 'NSIDC',
                        osStartIndex: 1,
                        osItemsPerPage: 1,
                        osFacetFilters: {}
                    }
                },
                provider = new OpenSearchProvider();

            provider.queryOpenSearch(options);
            expect(queryStub).toHaveBeenCalled();
            expect(queryStub.getCall(0)[0].parameters).toEqual({
                searchTerms: '',
                'nsidc:title': '',
                'nsidc:parameters': '',
                'nsidc:sensors': '',
                'nsidc:authors': '',
                startIndex: 1,
                count: 1,
                'geo:box': '',
                'geo:relation': undefined,
                'time:start': '',
                'time:end': '',
                'nsidc:source': 'NSIDC',
                'nsidc:facetFilters': '',
                sortKeys: undefined
            });
        });
    });

    describe('in-progress searches', function () {
        it('should invoke callback successHandle function when the search returns successfully', function () {
            var provider = new OpenSearchProvider(),
                fakeJqXhr = {responseText: '<feed></feed>'},
                optionSuccessStub = sinon.stub();

            sinon.stub(OpenSearchlight, 'ensureParamsHasOsdd');
            sinon.stub(OpenSearchlight.OpenSearchDescriptionDocument.prototype, 'initialize');
            sinon.stub(OpenSearchlight.OpenSearchDescriptionDocument.prototype, 'getQueryUrl');
            sinon.stub($, 'ajax').yieldsTo('success', null, null, fakeJqXhr);

            // act
            provider.requestJSON({
                contentType: 'application/nsidc:facets+xml',
                osParameters: {},
                success: optionSuccessStub
            });

            expect(optionSuccessStub).toHaveBeenCalled();

            OpenSearchlight.ensureParamsHasOsdd.restore();
            OpenSearchlight.OpenSearchDescriptionDocument.prototype.initialize.restore();
            OpenSearchlight.OpenSearchDescriptionDocument.prototype.getQueryUrl.restore();
            jQuery.ajax.restore();
        });

        it('aborts the search request on search:cancel', function () {
            var provider = new OpenSearchProvider(),
                jqXhrSent = new JqXhrBuilder({state: 2});

            provider.holdRequest(jqXhrSent);
            sinon.stub(OpenSearchlight, 'query');

            provider.onSearchCancel();

            expect(jqXhrSent.abort).toHaveBeenCalledOnce();
            OpenSearchlight.query.restore();
        });

        it('only aborts a search request once', function () {
            var provider = new OpenSearchProvider(),
                jqXhrSent = new JqXhrBuilder({state: 2});

            provider.holdRequest(jqXhrSent);
            sinon.stub(OpenSearchlight, 'query');

            provider.onSearchCancel();
            provider.onSearchCancel();

            expect(jqXhrSent.abort).toHaveBeenCalledOnce();
            OpenSearchlight.query.restore();
        });

        it('aborts the previous ongoing request when a new request is sent', function () {
            var provider = new OpenSearchProvider(),
                jqXhrSent = new JqXhrBuilder({state: 2});

            provider.holdRequest(jqXhrSent);
            sinon.stub(OpenSearchlight, 'query');

            provider.requestJSON({osParameters: {}});

            expect(jqXhrSent.abort).toHaveBeenCalledOnce();
            OpenSearchlight.query.restore();
        });

    });
});
