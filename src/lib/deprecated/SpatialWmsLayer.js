import OpenLayers from 'ol';

var SpatialWmsLayer = OpenLayers.Class(OpenLayers.Layer.WMS, {

  defaultOptions : {
    format: 'image/png'
  },

  initialize : function (name, layer, options, wrapDateLine) {

    this.name = name;
    this.layer = layer;
    this.options = OpenLayers.Util.extend(options, this.defaultOptions);
    this.wrapDateLine = wrapDateLine;
    OpenLayers.Layer.WMS.prototype.initialize.apply(
      this, arguments
    );

  }
});

export default SpatialWmsLayer;
