define(['views/result_item/DetailsSectionView'], function (DetailsSectionView) {
  describe('Details Section View', function () {
    var sectionView,
        element,
        template = '<span class="temp"><%= data %></span>',
        data = 'data';

    beforeEach(function () {
      element = document.createElement('div');
    });

    it('creates a correctly structured element', function () {
      sectionView = new DetailsSectionView({ sectionTemplate: template, sectionData: data });

      expect(sectionView.$el).toBe('div');
      expect(sectionView.$el).toHaveClass('section');
    });

    it('should render the section template with the section data', function () {
      sectionView = new DetailsSectionView({ el: element, sectionTemplate: template, sectionData: data }).render();

      expect(sectionView.$el.find('.temp')).toBe('span');
      expect(sectionView.$el.find('.temp')).toHaveText(data);
    });

    describe('expanded initial state', function () {
      beforeEach(function () {
        sectionView = new DetailsSectionView({ el: element, sectionTemplate: template, sectionData: data, expanded: true }).render();
      });

      it('displays the full data', function () {
        expect(sectionView.$el).toHaveClass('expanded');
      });

      it('does not display a show more button', function () {
        expect(sectionView.$el.find('.expandButton')).toHaveClass('hidden');
      });

      it('does not display a show less button', function () {
        expect(sectionView.$el.find('.collapseButton')).toHaveClass('hidden');
      });
    });
  });
});
