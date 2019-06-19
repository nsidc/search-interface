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

    bootstrap: '../contrib/bootstrap/js',
    jasmine_jquery: '../contrib/jasmine-jquery',
    jasmine_sinon: '../contrib/jasmine-sinon',
    jquery_tipsy: '../contrib/tipsy/javascripts',
    moment: '../contrib/moment',
    openlayers: '../contrib/openlayers/js/ol',
    opensearchlight: '../contrib/opensearchlight',
    require_mocking: 'src/scripts/lib',
    typeahead: '../contrib/typeahead',
    xregexp: '../contrib/xregexp'
  },
  shim: {
    'vendor/debug': {
      exports: 'debug'
    }
  },
});

require(['backbone'], function() {
});