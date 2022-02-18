import SummaryView from '../../views/result_item/SummaryView';

describe('Summary View', function () {

    var summaryView, summaryModel, resultModel, element, summary, tags;

    beforeEach(function () {
        element = document.createElement('div');
    });

    describe('with no summary', function () {

        beforeEach(function () {
            summaryModel = new Backbone.Model();
            summaryView = new SummaryView({el: element, model: summaryModel});
            summaryView.render();
        });

        it('should have an empty summary div', function () {
            expect($(element).find('.summary').text().length).toEqual(0);
        });

    });

    describe('with a short summary', function () {
        beforeEach(function () {
            summary = 'A short summary';
            summaryModel = new Backbone.Model({summary: summary});
            summaryView = new SummaryView({el: element, model: summaryModel});
            summaryView.render();
        });

        it('displays the summary text', function () {
            expect($(element).html()).toContain('short summary');
        });

        it('does not display an ellipsis', function () {
            expect($(element).html()).not.toContain('...');
        });

        it('does not display a show more button', function () {
            expect($(element).html()).not.toContain('Show More');
        });

        it('does not display a show less button', function () {
            expect($(element).html()).not.toContain('Show Less');
        });

        it('it does display updated date and tags', function () {
            expect($(element).html()).toContain('class="keywords');
            expect($(element).html()).toContain('class="updated');
        });

    });


    describe('with a short summary with a long tags list', function () {
        beforeEach(function () {
            summary = 'A short summary sdasdasdasdasdddddddddddddddddddddasm';
            tags = ['nklasdnklasdnklasdnklasdnklasdfnkl;asdnkl;asdnkl;asdnkl',
                'nklsdfnklsdfnklnklsdfnklsdfnklsdfnkldfnklfdnklnklsdfnklsdfnkln',
                'hdhwdd23468934hoaefhafhioasdfhiodfhioasdfhioasdfhioasdfasdfdas',
                'bjascbjlasdbjklasdbjlasdawdguiqweguiqweguiqweguiqweguiqweguiqw',
                'nklasdnhklasdbnklasdbnklasdbklasdblasdblasdbklbklasdbklasdlhil'];

            resultModel = new Backbone.Model({summary: summary, keywords: tags});
            summaryView = new SummaryView({el: element, model: resultModel});
            summaryView.render();
        });

        it('contains the full summary text', function () {
            expect($(element).html()).toContain('A short summary');
        });

        it('displays only the first part of the summary text', function () {
            expect($(element)).not.toHaveClass('expanded');
        });

        it('displays the ellipsis', function () {
            expect($(element).html()).toContain('...');
        });

        it('displays the show more button', function () {
            expect($(element).find('.expandButton')).toHaveClass('visible');
        });

        it('does not display the show less button', function () {
            expect($(element).find('.collapseButton')).toHaveClass('hidden');
        });

    });


    describe('with a long summary', function () {
        beforeEach(function () {

            summary = 'This data set contains O-Buoy1 ' +
                'Deployment data. Daily, hourly or continuous measu' +
                'rements over Arctic Ocean sea ice of O3, CO2, BrO ' +
                '(also for UV radiation fields, clouds, NO2, HONO, ' +
                'IO, ClO, stratospheric O3, glyoxal, aerosol optica' +
                'l depths to be added soon as by-products), wind sp' +
                'eed and direction, air temperature and RH, baromet' +
                'ric pressure';

            summaryModel = new Backbone.Model({summary: summary});
            summaryView = new SummaryView({el: element, model: summaryModel});
            summaryView.render();
        });

        it('contains the full summary text', function () {
            expect($(element).html()).toContain('This data set');
            expect($(element).html()).toContain('barometric pressure');
        });

        it('displays only the first part of the summary text', function () {
            expect($(element)).not.toHaveClass('expanded');
        });

        it('displays the ellipsis', function () {
            expect($(element).html()).toContain('...');
        });

        it('displays the show more button', function () {
            expect($(element).find('.expandButton')).toHaveClass('visible');
        });

        it('does not display the show less button', function () {
            expect($(element).find('.collapseButton')).toHaveClass('hidden');
        });
    });
});
