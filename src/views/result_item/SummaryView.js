import * as Backbone from 'backbone';
import _ from 'underscore';
import DetailsSectionView from './DetailsSectionView';
import viewTemplate from '../../templates/result_item/summary.html';

const sectionTemplate = '<span class=\'summary-text\'><%= data %></span>';

class SummaryView extends Backbone.View {
    render() {
        let summarySection,
            maxLength = 320,
            summary = (this.model.get('summary') || '');

        this.$el.html(_.template(viewTemplate));

        summarySection = new DetailsSectionView({
            sectionTemplate: sectionTemplate,
            sectionData: summary,
            expanded: summary.length <= maxLength
        }).render();

        this.$el.find('.summary-section').append(summarySection.el);

        return this;
    }
}

export default SummaryView;
