var tests = [];
for (var file in window.__karma__.files) {
  if (/_spec\.js$/.test(file)) {
    tests.push(file);
  }
}

requirejs.config({
  baseUrl: '/base/src/scripts',
  deps: tests,
  callback: window.__karma__.start,
  paths: {
    vendor: '../vendor',

    backbone: '../contrib/backbone',
    bootstrap: '../contrib/bootstrap/js',
    jasmine_jquery: '../contrib/jasmine-jquery',
    jasmine_sinon: '../contrib/jasmine-sinon',
    jquery: '../contrib/jquery',
    jquery_tipsy: '../contrib/tipsy/javascripts',
    moment: '../contrib/moment',
    openlayers: '../contrib/openlayers',
    opensearchlight: '../contrib/opensearchlight',
    require_mocking: 'src/scripts/lib',
    sinon: '../contrib/sinon',
    typeahead: '../contrib/typeahead',
    underscore: '../contrib/underscore',
    xregexp: '../contrib/xregexp'
  },
  shim: {
    'vendor/debug': {
      exports: 'debug'
    }
  }
});