requirejs.config({
  paths: {
    vendor: '../vendor',

    sprintf: '../contrib/sprintf/sprintf.min',
    text: '../vendor/requirejs/text',
    templates: '../templates/underscore',
  },
});

require([
  'appConfig',
  'iocConfig',
  'lib/objectFactory'
], function (
  appConfig,
  iocConfig,
  objectFactory
) {
  // bootstrap the object factory
  objectFactory.setConfig(iocConfig);

  require(['lib/SearchApp'], function (SearchApp) {
    // Start up the app...
    var appOptions = {
      el: $('#main-content')
    };
    new SearchApp(appOptions, appConfig);
  });
});
