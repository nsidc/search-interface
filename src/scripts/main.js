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

  require(['lib/AdeSearchApp'], function (AdeSearchApp) {
    // Start up the app...
    var appOptions = {
      el: $('#main-content')
    };
    new AdeSearchApp(appOptions, appConfig);
  });
});
