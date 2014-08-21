/* jshint maxcomplexity: false */
// the straightforward switch statement has high cyclomatic complexity, so skip
// the check here

// runtime config loading so requirejs configuration is not dynamically changed
// in main.js
define([
  'conf/acadis/appConfig-integration',
  'conf/acadis/appConfig-qa',
  'conf/acadis/appConfig-production',
  'conf/nsidc/appConfig-integration',
  'conf/nsidc/appConfig-qa',
  'conf/nsidc/appConfig-production'
], function (
  acadisInt,
  acadisQA,
  acadisProd,
  nsidcInt,
  nsidcQA,
  nsidcProd
) {

  // nsidc is a global defined in index.html
  switch (nsidc.project + '|' + nsidc.environment) {

  case 'ACADIS|development':
  case 'ACADIS|integration':
    return acadisInt;

  case 'ACADIS|qa':
    return acadisQA;

  case 'ACADIS|staging':
  case 'ACADIS|production':
    return acadisProd;


  case 'NSIDC|development':
  case 'NSIDC|integration':
    return nsidcInt;

  case 'NSIDC|qa':
    return nsidcQA;

  case 'NSIDC|staging':
  case 'NSIDC|production':
    return nsidcProd;


  default:
    throw new Error('Either project "' + nsidc.project + '" or environemnt "' + nsidc.environment + '" is invalid.');

  }

});
