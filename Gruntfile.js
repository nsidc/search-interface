module.exports = function (grunt) {

  var requirejsConf,
      runFiles,
      sassConf,
      watchFiles;

  requirejsConf = {
    appDir: 'src/',
    baseUrl: 'scripts/',
    dir: 'tmp/',
    findNestedDependencies: true,
    generateSourceMaps: true,
    inlineText: true,
    name: 'main',
    optimize: 'uglify2',
    optimizeCss: 'none',
    paths: {
      conf: '../conf/',
      appConfig: '../conf/appConfig',
      iocConfig: '../conf/iocConfig',
      templates: '../templates/underscore',
      vendor: '../vendor'
    },
    preserveLicenseComments: false,
    shim: {
      'vendor/debug': {
        exports: 'debug'
      }
    }
  };

  // files that tasks run on
  runFiles = {
    jshint: ['Gruntfile.js', 'src/scripts/**/*.js', 'spec/**/*.js', 'src/conf/**/*.js'],
    scsslint: ['src/sass/**/*.scss'],
    specs: ['spec/**/*.js']
  };

  sassConf = {
    bundleExec: true,
    compass: true,
    precision: 2,
    sourcemap: true,
    style: '<%= environment === "development" ? "expanded" : "compressed" %>',
    lineNumbers: '<%= environment === "development" %>'
  };

  // files that should trigger their tasks when changed while `grunt watch` is
  // happening; mostly this includes runFiles and relevant config files
  watchFiles = {
    jshint: runFiles.jshint.concat(['.jshintrc']),
    scsslint: runFiles.scsslint.concat(['config/scss-lint*.yml']),
    specs: runFiles.specs.concat(['src/scripts/**/*.js', 'src/conf/**/*.js', 'src/templates/underscore/**/*.html'])
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    environment: grunt.option('environment') || 'development',

    clean: {
      dev: ['src/index*.html', 'src/css/'],

      tmp: ['tmp/'],

      // requirejs optimizer copies in conf/, templates/, scripts/collections,
      // scripts/lib, scripts/models, and scripts/views, but that is all
      // contained in main.js anyway
      'post-build': ['tmp/conf/', 'tmp/templates/', 'tmp/scripts/*', '!tmp/scripts/main.*']
    },

    connect: {
      spec: {
        options: {
          port: 8081
        }
      },
      site: {
        options: {
          base: 'src',
          hostname: '',
          keepalive: true,
          middleware: function (connect, options) {
            var virtualSsi = require('connect-ssi');
            return [
              require('grunt-connect-proxy/lib/utils').proxyRequest,
              virtualSsi('http://qa.nsidc.org'),
              connect.static(options.base)
            ];
          },
          port: 8080
        },
        proxies: [
          {
            context: '/api/dataset/2/',
            host: 'liquid.colorado.edu',
            port: '10680'
          }
        ]
      }
    },

    // after hooks are installed, they can still be ignored by passing the
    // option --no-verify
    githooks: {
      all: {
        'pre-commit': 'scsslint jshint',
        'pre-push': 'jasmine'
      }
    },

    // 'jade:acadis' and 'jade:nsidc' used when the portal is built for
    // deployment; use '-dev' for local development
    jade: {
      options: {
        basedir: 'src',
        pretty: true
      },
      'acadis-dev': {
        options: {
          data: {
            environment: '<%= environment %>',
            project: 'ACADIS',
            title: 'Arctic Data Explorer',
            version: '<%= pkg.version %>'
          }
        },
        files: {
          'src/index-acadis.html': ['src/templates/acadis-index.jade'],
          'src/index.html': ['src/templates/acadis-index.jade']
        }
      },
      'nsidc-dev': {
        options: {
          data: {
            environment: '<%= environment %>',
            project: 'NSIDC',
            title: 'NSIDC Scientific Data Search',
            version: '<%= pkg.version %>'
          }
        },
        files: {
          'src/index-nsidc.html': ['src/templates/nsidc-index.jade'],
          'src/index.html': ['src/templates/nsidc-index.jade']
        }
      },
      acadis: {
        options: {
          data: {
            environment: '<%= environment %>',
            project: 'ACADIS',
            title: 'Arctic Data Explorer',
            version: '<%= pkg.version %>'
          }
        },
        files: {
          'tmp/index.html': ['src/templates/acadis-index.jade']
        }
      },
      nsidc: {
        options: {
          data: {
            environment: '<%= environment %>',
            project: 'NSIDC',
            title: 'NSIDC Scientific Data Search',
            version: '<%= pkg.version %>'
          }
        },
        files: {
          'tmp/index.html': ['src/templates/nsidc-index.jade']
        }
      }
    },

    jasmine: {
      all: {
        src: [],
        options: {
          helpers: ['spec/specHelper.js'],
          junit: {
            path: 'tmp/log/spec/'
          },
          keepRunner: true,
          specs: runFiles.specs,
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            requireConfig: {
              baseUrl: 'src/scripts/',
              paths: {
                conf: '../conf/nsidc',
                templates: '../templates/underscore',
                vendor: '../vendor'
              },
              shim: {
                'vendor/debug': {
                  exports: 'debug'
                }
              }
            }
          },
          vendor: [
            'src/contrib/underscore/underscore-min.js',
            'src/contrib/underscore/underscore.string.min.js',
            'src/contrib/jquery/jquery-1.11.0.min.js',
            'src/contrib/jquery-1.7.1/jquery-ui-message-1.5.37.min.js',
            'src/contrib/backbone/backbone-min.js',
            'src/contrib/bootstrap/js/bootstrap.min.js',
            'src/contrib/bootstrap-datepicker/bootstrap-datepicker.min.js',
            'src/contrib/momentjs/moment.min.js',
            'src/contrib/proj4js-1.1.0/proj4js-compressed.js',
            'src/contrib/openlayers-2.12/OpenLayers.debug.js',
            'src/contrib/opensearchlight/OpenSearchlight.js',
            'src/contrib/xregexp/xregexp-all-min.js',
            'src/contrib/sinon/sinon-1.6.0.js',
            'src/contrib/tipsy/javascripts/jquery.tipsy.js',
            'src/contrib/jasmine-jquery-1.4.2/jasmine-jquery-1.4.2.js',
            'src/contrib/jasmine-sinon/jasmine-sinon.js',
            'src/contrib/typeahead/typeahead.bundle.min.js',
            'src/scripts/lib/require_mocking.js'
          ]
        }
      }
    },

    jshint: {
      all: runFiles.jshint,
      options: {
        jshintrc: '.jshintrc'
      }
    },

    requirejs: {
      acadis: {
        options: requirejsConf
      },
      nsidc: {
        options: requirejsConf
      }
    },

    // 'sass:acadis' and 'sass:nsidc' used when the portal is built for
    // deployment; use 'sass:dev' for local development
    //
    // sass/ must have the same parent directory as css/ for sourcemaps to work;
    // when building for deployment, the requirejs optimizer first copies
    // src/sass/ to tmp/sass
    sass: {
      'dev': {
        files: {
          'src/css/acadis-search.css': 'src/sass/acadis_main.scss',
          'src/css/nsidc-search.css': 'src/sass/nsidc_main.scss'
        },
        options: sassConf
      },
      acadis: {
        files: {
          'tmp/css/acadis-search.css': 'tmp/sass/acadis_main.scss'
        },
        options: sassConf
      },
      nsidc: {
        files: {
          'tmp/css/nsidc-search.css': 'tmp/sass/nsidc_main.scss'
        },
        options: sassConf
      }
    },

    scsslint: {
      all: runFiles.scsslint,
      options: {
        config: 'config/scss-lint.yml'
      }
    },

    watch: {
      'build-acadis': {
        files: ['src/sass/**/*', 'src/templates/*.jade', 'Gruntfile.js'],
        tasks: ['build:acadis-dev']
      },
      'build-nsidc': {
        files: ['src/sass/**/*', 'src/templates/*.jade', 'Gruntfile.js'],
        tasks: ['build:nsidc-dev']
      },
      'sass': {
        files: ['src/sass/**/*'],
        tasks: ['sass:dev']
      },
      'lint-test': {
        files: Array.prototype.concat(
          watchFiles.jshint,
          watchFiles.scsslint,
          watchFiles.specs
        ),
        tasks: ['lint-test']
      },
      jshint: {
        files: watchFiles.jshint,
        tasks: ['jshint']
      },
      scsslint: {
        files: watchFiles.scsslint,
        tasks: ['scsslint']
      },
      specs: {
        files: watchFiles.specs,
        tasks: ['jasmine']
      }
    }

  });

  grunt.loadNpmTasks('grunt-connect-proxy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-githooks');
  grunt.loadNpmTasks('grunt-scss-lint');

  // build tasks for local development; note that both projects are built
  //
  // both build tasks allow NSIDC Search to be mounted at /data/search/ and
  // ADE to be mounted at /acadis/search/ on your localhost
  //
  // build:nsidc-dev allows NSIDC Search to be mounted at /
  // build:acadis-dev allows ADE to be mounted at /
  grunt.registerTask('build:acadis-dev', ['clean:dev', 'jade:nsidc-dev', 'jade:acadis-dev', 'sass:dev']);
  grunt.registerTask('build:nsidc-dev', ['clean:dev', 'jade:acadis-dev', 'jade:nsidc-dev', 'sass:dev']);

  // build tasks for deployment
  grunt.registerTask('build:acadis', ['clean:tmp', 'requirejs:acadis', 'jade:acadis', 'sass:acadis', 'clean:post-build']);
  grunt.registerTask('build:nsidc', ['clean:tmp', 'requirejs:nsidc', 'jade:nsidc', 'sass:nsidc', 'clean:post-build']);

  grunt.registerTask('lint-test', ['scsslint', 'jshint', 'jasmine']);
  grunt.registerTask('serve-tests', 'connect:spec:keepalive');
  grunt.registerTask('server', 'connect:site');

  grunt.registerTask('default', ['lint-test']);

};
