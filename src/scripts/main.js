require.config({
  baseUrl: 'scripts/',
  name: 'main',
  paths: {
    backbone: '../contrib/backbone/backbone',
    jquery: '../contrib/jquery/jquery.min',
    'jquery-ui-message': '../contrib/jquery-ui-message/jquery.ui.message',
    underscore: '../contrib/underscore/underscore',
    'underscore.string': '../contrib/underscore/underscore.string.min',
    leaflet: '../contrib/leaflet/index',
    'leaflet-dvf': '../contrib/leaflet-dvf/leaflet-dvf.min',
    openlayers: '../contrib/openlayers/OpenLayers',
    opensearchlight: '../contrib/opensearchlight/index',
    moment: '../contrib/momentjs/moment.min',
    xregexp: '../contrib/xregexp/xregexp-all-min',
    bootstrap: '../contrib/bootstrap/docs/assets/js/bootstrap.min',
    'bootstrap-datepicker': '../contrib/bootstrap-datepicker/bootstrap-datepicker',
    bloodhound: '../contrib/typeaheadjs/typeahead.bundle.min',
    tipsy: '../contrib/tipsy/src/javascripts/jquery.tipsy',
    'ie-warn': '../contrib/ie-warn/ie-warn-latest.min',
    'web-socket': '../contrib/web-socket-js/web_socket',
    'swfobject': '../contrib/web-socket-js/swfobject'
  },
  shim: {
    backbone: {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    jquery: {
      exports: ['$']
    },
    underscore: {
      deps: ['jquery'],
      exports: '_'
    },
    openlayers: {
      exports: 'OpenLayers'
    },
    bloodhound: {
      exports: 'Bloodhound'
    }
  }
});

require([
  'backbone',
  'jquery',
  'underscore',
  'underscore.string',
  'openlayers',
  'iocConfig',
  'appConfig',
  'lib/objectFactory'
], function (
  Backbone,
  $,
  _,
  _str,
  OpenLayers,
  iocConfig,
  appConfig,
  objectFactory
) {
  // bootstrap the object factory
  objectFactory.setConfig(iocConfig);

  // extend underscore with underscore.string
  _.mixin(_str.exports());

  require(['lib/AcadisSearchApp'], function (AcadisSearchApp) {
    // Start up the app...
    var appOptions = {
      el: $('#main-content')
    };
    new AcadisSearchApp(appOptions, appConfig);
  });
});
