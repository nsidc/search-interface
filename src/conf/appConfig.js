/* jshint maxcomplexity: false */
// the straightforward switch statement has high cyclomatic complexity, so skip
// the check here

// runtime config loading so requirejs configuration is not dynamically changed
// in main.js
define([
  'conf/ade/appConfig-integration',
  'conf/ade/appConfig-qa',
  'conf/ade/appConfig-production',
  'conf/nsidc/appConfig-integration',
  'conf/nsidc/appConfig-qa',
  'conf/nsidc/appConfig-production'
], function (
  adeInt,
  adeQA,
  adeProd,
  nsidcInt,
  nsidcQA,
  nsidcProd
) {

  // nsidc is a global defined in index.html
  switch (nsidc.project + '|' + nsidc.environment) {

  case 'ADE|development':
  case 'ADE|integration':
    return adeInt;

  case 'ADE|qa':
    return adeQA;

  case 'ADE|staging':
  case 'ADE|blue':
  case 'ADE|production':
    return adeProd;


  case 'NSIDC|development':
  case 'NSIDC|integration':
    return nsidcInt;

  case 'NSIDC|qa':
    return nsidcQA;

  case 'NSIDC|staging':
  case 'NSIDC|blue':
  case 'NSIDC|production':
    return nsidcProd;


  default:
    throw new Error('Either project "' + nsidc.project + '" or environemnt "' + nsidc.environment + '" is invalid.');

  }

});
