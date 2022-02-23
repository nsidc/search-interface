import ResultKeywordsView from '../../views/result_item/ResultKeywordsView';

describe('Result Keywords View', function () {

    var resultKeywordsView,
        resultKeywordsModel,
        element,
        resultKeywords;

    describe('with no keywords', function () {
        beforeEach(function () {
            resultKeywordsModel = new Backbone.Model();
            element = document.createElement('div');
            resultKeywordsView = new ResultKeywordsView({el: element, model: resultKeywordsModel});
        });

        it('should have an empty keywords div', function () {
            resultKeywordsView.render();
            expect($(element).find('.keywords').text().length).toEqual(0);
        });

    });

    describe('with keywords', function () {
        beforeEach(function () {
            resultKeywords = ['ice', 'snow'];
            resultKeywordsModel = new Backbone.Model({keywords: resultKeywords});
            element = document.createElement('div');
            resultKeywordsView = new ResultKeywordsView({el: element, model: resultKeywordsModel});
        });

        it('displays the resultKeywords', function () {
            resultKeywordsView.render();
            expect($(element).html()).toContain('ice; snow');
        });

    });

});
