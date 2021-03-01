import _ from 'underscore';
import DetailsView from './DetailsView';
import viewTemplate from '../../templates/result_item/details_section.html';

class DetailsSectionView extends DetailsView {
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
}

export default DetailsSectionView;
