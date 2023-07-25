import OpenLayers from 'ol';

import SpatialSelectionControl from './SpatialSelectionControl';

var OpenLayersCustomToolbar = OpenLayers.Class(OpenLayers.Control.Panel, {

    initialize : function (selectionLayer, options) {
        var bboxControl = new SpatialSelectionControl(
                selectionLayer,
                OpenLayers.Handler.RegularPolygon, {
                    'displayClass': 'olControlDrawFeaturePolygon'
                }),

            panningControl = new OpenLayers.Control.Navigation({
                'dragPanOptions': { enableKinetic: true },
                'deactivate': function () {
                    if (this.map.getZoom() === 0) {
                        $('.olControlNavigationItemInactive').addClass('disabled');
                    }
                    OpenLayers.Control.Navigation.prototype.deactivate.call(this);
                },
                'activate': function () {
                    if (this.map.getZoom() !== 0) {
                        $('.olControlNavigationItemInactive').removeClass('disabled');
                        OpenLayers.Control.Navigation.prototype.activate.call(this);
                    } else {
                        bboxControl.activate();
                    }
                }
            });

        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
        this.addControls([bboxControl, panningControl]);
        this.displayClass = 'olControlEditingToolbar';
        this.defaultControl = this.controls[0];
    },

    draw: function () {
        return OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);
    }

});

export default OpenLayersCustomToolbar;
