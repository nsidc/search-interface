// runtime config loading so requirejs configuration is not dynamically changed
// in main.js
define([
  'conf/acadis/iocConfig',
  'conf/nsidc/iocConfig'
], function (
  acadisIocConf,
  nsidcIocConf
) {

  // nsidc is a global defined in index.html
  switch (nsidc.project) {

  case 'ACADIS':
    return acadisIocConf;

  case 'NSIDC':
    return nsidcIocConf;

  default:
    throw new Error('No such project');

  }

});
