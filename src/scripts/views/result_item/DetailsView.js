
define([], function () {
  var DetailsView;

  DetailsView = Backbone.View.extend({

    events: {
      'click a.expandButton': 'expand',
      'click a.collapseButton': 'collapse'
    },

    expand: function () {
      this.$('.expandButton').addClass('hidden');
      this.$('.expandButton').removeClass('visible');

      this.$('.collapseButton').addClass('visible');
      this.$('.collapseButton').removeClass('hidden');

      this.$('.showMore').hide();
      this.$el.addClass('expanded');
    },

    collapse: function () {
      this.$('.collapseButton').addClass('hidden');
      this.$('.collapseButton').removeClass('visible');

      this.$('.expandButton').addClass('visible');
      this.$('.expandButton').removeClass('hidden');

      this.$('.showMore').show();
      this.$el.removeClass('expanded');
    }

  });

  return DetailsView;
});
