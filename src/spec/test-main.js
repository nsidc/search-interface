var tests = [];
var XRegExp;

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

        text: '../vendor/requirejs/text',
        templates: '../templates/underscore',
    },
    shim: {
        'vendor/debug': {
            exports: 'debug'
        }
    },
});

require(['xregexp', 'backbone', 'bootstrap-datepicker'], function(xregexp) {
    XRegExp = xregexp;
});