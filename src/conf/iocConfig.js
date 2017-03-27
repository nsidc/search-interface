// runtime config loading so requirejs configuration is not dynamically changed
// in main.js
define([
  'conf/ade/iocConfig',
  'conf/nsidc/iocConfig'
], function (
  adeIocConf,
  nsidcIocConf
) {

  // nsidc is a global defined in index.html
  switch (nsidc.project) {

  case 'ADE':
    return adeIocConf;

  case 'NSIDC':
    return nsidcIocConf;

  default:
    throw new Error('No such project');

  }

});
