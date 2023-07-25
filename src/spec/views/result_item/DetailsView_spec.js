import DetailsView from '../../views/result_item/DetailsView';

describe('Details View', function () {
    var detailsView, model, element, stubHtml;

    // TODO [IT, 2013-05-01]: This embedded HTML has a certain smell to it.  Can it be removed?
    stubHtml = '<div><p class="summary"><span class="showMore"><a class="expandButton visible">More Detail</a></span>' +
      '<p>content</p><p><a class="collapseButton hidden"> Less Detail</a></p></p></div>';

    beforeEach(function () {
        element = document.createElement('div');
        model = new Backbone.Model();
        detailsView = new DetailsView({el: element, model: model});
        sinon.stub(detailsView, 'render').returns(detailsView.$el.append($(stubHtml).html()));
        detailsView.render();
    });

    describe('when I press the show more button', function () {
        beforeEach(function () {
            detailsView.expand();
        });

        it('hides the show more button', function () {
            expect($(element).find('.expandButton')).not.toHaveClass('visible');
            expect($(element).find('.expandButton')).toHaveClass('hidden');
        });

        it('displays the show less button', function () {
            expect($(element).find('.collapseButton')).toHaveClass('visible');
            expect($(element).find('.collapseButton')).not.toHaveClass('hidden');
        });

        it('displays the full summary text', function () {
            expect($(element)).toHaveClass('expanded');
        });

        describe('when I then press the show less button', function () {
            beforeEach(function () {
                detailsView.collapse();
            });

            it('displays the show more button', function () {
                expect($(element).find('.expandButton')).toHaveClass('visible');
                expect($(element).find('.expandButton')).not.toHaveClass('hidden');
            });

            it('hides the show less button', function () {
                expect($(element).find('.collapseButton')).not.toHaveClass('visible');
                expect($(element).find('.collapseButton')).toHaveClass('hidden');
            });

            it('displays only the first part of the summary text', function () {
                expect($(element)).not.toHaveClass('expanded');
            });

        });
    });
});
