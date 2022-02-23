import OpenLayers from 'ol';

import mediatorMixin from '../mediator_mixin';

var SpatialSelectionTransformControl = OpenLayers.Class(OpenLayers.Control.TransformFeature, {
    defaultOptions : {
        renderIntent: 'transform'
    },

    initialize : function (selectionLayer, options) {
        this.rotate = false;
        this.selectionLayer = selectionLayer;

        this.options = OpenLayers.Util.extend(
            options, this.defaultOptions
        );
        OpenLayers.Control.TransformFeature.prototype.initialize.apply(
            this, arguments
        );

        this.bindEvents();
    },

    bindEvents : function () {
        this.events.register('transformcomplete', this, this.onSelectionDone);
    },

    onSelectionDone : function (evt) {
        this.mediator.trigger('map:selectionDone', evt.feature.geometry);
    }
});

_.extend(SpatialSelectionTransformControl.prototype, mediatorMixin);

export default SpatialSelectionTransformControl;
