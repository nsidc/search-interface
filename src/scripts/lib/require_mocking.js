(function () {

  var root = this,    // root will be either `window` in a browser, or `GLOBAL` in node
      requireMock = root.requireMock || {};

  // Source: https://coderwall.com/p/teiyew
  requireMock.createContext = function (stubs) {
    var map, contextId, context;

    // Create a new map which will override the path to a given dependency
    map = {};

    _.each(stubs, function (value, key) {
      var stubname = 'stub_' + key;
      map[key] = stubname;
    });

    // Create a new context with the new dependency paths
    contextId = Math.floor(Math.random() * 1000000);
    context =  require.config({
      context: contextId,
      baseUrl: '/base/src/scripts/',
      paths: {
        conf: '../conf/nsidc',
        templates: '../templates/underscore/',
        text: '../vendor/requirejs/text',
        vendor: '../vendor'
      },
      map: {
        '*': map
      },
      shim: {
        'vendor/debug': {
          exports: 'debug'
        }
      }
    });

    // Create new definitions that will return our passed stubs or mocks
    _.each(stubs, function (value, key) {
      var stubname = 'stub_' + key;
      define(stubname, function () {
        return value;
      });
    });

    return context;
  };

  // Single function callable wrapper for createContext
  requireMock.requireWithStubs = function (stubs, deps, callback) {
    var context = requireMock.createContext(stubs);
    context(deps, callback);
  };

  root.requireMock = requireMock;
}).call(this);
