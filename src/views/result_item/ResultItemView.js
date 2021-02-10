/* jshint esversion: 6 */

import * as Backbone from 'backbone';
import DataFormatView from './DataFormatView';
import ParametersView from './ParametersView';
import SpatialMetadataView from './SpatialMetadataView';
import SummaryView from './SummaryView';
import SupportingProgramsView from './SupportingProgramsView';
import TemporalMetadataView from './TemporalMetadataView';
import viewTemplate from '../../templates/result_item/result_item.html';
import _ from 'underscore';

class ResultItemView extends Backbone.View {
    initialize(options) {
        this.options = options;
    }

    render() {
        if(this.model) {
            this.$el.html(_.template(viewTemplate)({
                title: this.model.get('title'),
                url: this.model.get('catalogUrl'),
                authoritativeId: this.model.get('authoritativeId')
            }));

            new SupportingProgramsView({
                el: this.$el.find('.supporting-programs'),
                model: this.model
            });

            new SpatialMetadataView({
                el: this.$el.find('.spatial-coverage')[0],
                model: this.model,
                mapThumbnail: this.options.mapThumbnail,
                thumbnailBounds: this.options.thumbnailBounds,
                mapThumbnailShading: this.options.mapThumbnailShading,
                mapProjection: this.options.mapProjection,
                mapPixelSize: this.options.mapPixelSize
            });
            // }).render();

            new TemporalMetadataView({
                el: this.$el.find('.temporal-coverage'),
                model: this.model,
                forceRender: true
            });
            // ).render();

            new ParametersView({
                el: this.$el.find('.parameters'),
                model: this.model
            });
            // ).render();

            new DataFormatView({
                el: this.$el.find('.data-formats'),
                model: this.model
            });
            // ).render();

            new SummaryView({
                el: this.$el.find('.summary'),
                model: this.model
            });
            // ).render();
        }

        return this;
    }
}

export default ResultItemView;
