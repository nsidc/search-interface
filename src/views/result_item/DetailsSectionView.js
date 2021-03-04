import * as Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../../templates/result_item/details_section.html';

class DetailsSectionView extends Backbone.View {
    get className() {
        return 'section';
    }

    get events() {
        return {
            'click a.expandButton': 'expand',
            'click a.collapseButton': 'collapse'
        };
    }

    get tagName() {
        return 'div';
    }

    initialize(options) {
        this.options = options;
    }

    render() {
        let sectionTemplate;

        this.$el.html(_.template(viewTemplate));

        if(typeof this.options.sectionTemplate === 'function') {
            sectionTemplate = this.options.sectionTemplate;
        }
        else {
            sectionTemplate = _.template(this.options.sectionTemplate);
        }
        this.$el.prepend(sectionTemplate({data: this.options.sectionData}));

        if(this.options.expanded) {
            this.$el.addClass('expanded');
            this.$el.find('.expandButton').removeClass('visible').addClass('hidden');
            this.$el.find('.showMore').hide();
        }

        return this;
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

export default DetailsSectionView;
