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

  require(['lib/AcadisSearchApp'], function (AcadisSearchApp) {
    // Start up the app...
    var appOptions = {
      el: $('#main-content')
    };
    new AcadisSearchApp(appOptions, appConfig);
  });
});
