import * as Backbone from 'backbone';

class DetailsView extends Backbone.View {
    get events() {
        return {
            'click a.expandButton': 'expand',
            'click a.collapseButton': 'collapse'
        };
    }

    expand() {
        this.$('.expandButton').addClass('hidden');
        this.$('.expandButton').removeClass('visible');

        this.$('.collapseButton').addClass('visible');
        this.$('.collapseButton').removeClass('hidden');

        this.$('.showMore').hide();
        this.$el.addClass('expanded');
    }

    collapse() {
        this.$('.collapseButton').addClass('hidden');
        this.$('.collapseButton').removeClass('visible');

        this.$('.expandButton').addClass('visible');
        this.$('.expandButton').removeClass('hidden');

        this.$('.showMore').show();
        this.$el.removeClass('expanded');
    }
}

export default DetailsView;
