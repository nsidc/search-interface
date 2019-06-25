define(
  ['views/result_item/DetailsView',
   'text!templates/result_item/details_section.html'],
  function (DetailsView, detailsSectionTemplate) {
    var DetailsSectionView;

    DetailsSectionView = DetailsView.extend({
      className : 'section',
      tagName : 'div',

      initialize: function (options) {
        this.options = options;

      },

      render: function () {
        var sectionTemplate;

        this.$el.html(detailsSectionTemplate);

        if (typeof this.options.sectionTemplate === 'function') {
          sectionTemplate = this.options.sectionTemplate;
        } else {
          sectionTemplate = _.template(this.options.sectionTemplate);
        }
        this.$el.prepend(sectionTemplate({ data: this.options.sectionData }));

        if (this.options.expanded) {
          this.$el.addClass('expanded');
          this.$el.find('.expandButton').removeClass('visible').addClass('hidden');
          this.$el.find('.showMore').hide();
        }

        return this;
      }
    });

    return DetailsSectionView;
  }
);
