module.exports = function (grunt) {

  var urlPath,
      requirejsConf,
      runFiles,
      sassConf,
      watchFiles;

  urlPath = {
    nsidc_search: '/data/search'
  };

  requirejsConf = {
    appDir: 'src/',
    baseUrl: 'scripts/',
    dir: 'build/',
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

      vendor: '../vendor',

      text: '../vendor/requirejs/text',
      templates: '../templates/underscore',

      sprintf: '../contrib/sprintf/sprintf.min',

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
    sasslint: ['src/sass/**/*.scss'],
    specs: ['spec/**/*.js']
  };

  var sass = require('node-sass');
  sassConf = {
    implementation: sass,
    precision: 2,
    outputStyle: '<%= environment === "development" ? "expanded" : "compressed" %>'
  };

  // files that should trigger their tasks when changed while `grunt watch` is
  // happening; mostly this includes runFiles and relevant config files
  watchFiles = {
    jshint: runFiles.jshint.concat(['.jshintrc']),
    sasslint: runFiles.sasslint.concat(['config/sass-lint*.yml']),
    specs: runFiles.specs.concat(['src/scripts/**/*.js', 'src/conf/**/*.js', 'src/templates/underscore/**/*.html'])
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    environment: grunt.option('environment') || 'development',
    project: grunt.option('project'),
    urlPath: urlPath[grunt.option('project')],
    url: grunt.option('url') || 'http://<%= environment %>.nsidc.org/<%= urlPath %>',

    availabletasks: {
      tasks: {
        options: {
          filter: 'include',
          tasks: [
            'build:nsidc-dev',
            'build:nsidc_search',
            'default',
            'deploy',
            'githooks',
            'jshint',
            'release',
            'sasslint',
            'serve-tests',
            'tasks',
            'test:acceptance',
            'test:unit',
            'updateTag'
          ],
          groups: {
            'Build for Development': ['build:nsidc-dev'],
            'Deployment/Release': ['build:nsidc_search', 'deploy', 'release', 'updateTag'],
            'Miscellaneous': ['default', 'githooks', 'tasks'],
            'Syntax': ['sasslint', 'jshint'],
            'Tests': ['test:acceptance', 'test:unit', 'serve-tests']
          },
          descriptions: {
            'build:nsidc-dev': 'Compile Pug to HTML and Sass to CSS into src/ for NSIDC Search.',
            'build:nsidc_search': 'Compile Pug and Sass, minify JavaScript into build/ for NSIDC Search. [--environment]',
            'default': 'Run syntax checkers and unit tests.',
            'deploy': 'Copy build/ to /opt/$project on a VM [--environment --project]',
            'release': 'Bump version, update CHANGELOG.md, git tag, git push.',
            'serve-tests': 'Run unit tests (for debugging) in a browser with a connect web server.',
            'tasks': 'List available Grunt tasks & targets.',
            'test:acceptance': 'Run Cucumber features. [--environment --project]',
            'test:unit': 'Run jasmine specs headlessly through Chrome.',
            'updateTag': 'Update the git tag to indicate which commit is deployed. [--environment --project]'
          }
        }
      }
    },

    clean: {
      dev: ['src/index*.html', 'src/css/'],

      build: ['build/'],

      // requirejs optimizer copies in conf/, templates/, scripts/collections,
      // scripts/lib, scripts/models, and scripts/views, but that is all
      // contained in main.js anyway
      'post-build': ['build/conf/', 'build/templates/', 'build/scripts/*', 'build/build.txt', '!build/scripts/main.*']
    },

    connect: {
      spec: {
        options: {
          port: 8081
        }
      },
      site: {
        options: {
          base: '/base/src/',
          hostname: '',
          keepalive: true,
          middleware: function (connect, options) {
            var virtualSsi = require('connect-ssi');
            return [
              require('grunt-connect-proxy3/lib/utils').proxyRequest,
              virtualSsi('http://qa.nsidc.org'),
              connect.static(options.base)
            ];
          },
          port: 8080
        },
        proxies: [
          {
            context: '/api/dataset/2/',
            host: 'http://qa.nsidc.org'
          }
        ]
      }
    },

    /* jshint ignore:start */
    copy: {
      bower: {
        files: [
          {flatten: true, expand: true, src: ['bower_components/backbone/backbone.js'], dest: 'src/contrib/backbone/'},
          {flatten: true, expand: true, src: ['bower_components/bootstrap-datepicker/js/bootstrap-datepicker.js', 'bower_components/bootstrap-datepicker/css/datepicker.css'], dest: 'src/contrib/bootstrap-datepicker/'},
          {flatten: true, expand: true, src: ['bower_components/ie-warn/build/ie-warn-latest.min.js'], dest: 'src/contrib/ie-warn/'},
          {flatten: true, expand: true, src: ['bower_components/jquery-ui-message/src/js/jquery.ui.message.js'], dest: 'src/contrib/jquery-ui-message/'},
          {flatten: true, expand: true, src: ['bower_components/jquery/dist/jquery.min.js', 'bower_components/jquery/dist/jquery.min.map'], dest: 'src/contrib/jquery/'},
          {flatten: true, expand: true, src: ['bower_components/leaflet-dvf/dist/leaflet-dvf.min.js'], dest: 'src/contrib/leaflet-dvf/'},
          {flatten: true, expand: true, src: ['bower_components/moment/min/moment.min.js'], dest: 'src/contrib/momentjs/'},
          {flatten: true, expand: true, src: ['bower_components/opensearchlight/index.js'], dest: 'src/contrib/opensearchlight/'},
          {flatten: true, expand: true, src: ['bower_components/openlayers/build/OpenLayers.js'], dest: 'src/contrib/openlayers/'},
          {flatten: true, expand: true, src: ['bower_components/requirejs/require.js'], dest: 'src/contrib/requirejs/'},
          {flatten: true, expand: true, src: ['bower_components/underscore/underscore.js'], dest: 'src/contrib/underscore/'},
          {flatten: true, expand: true, src: ['bower_components/underscore.string/dist/underscore.string.min.js'], dest: 'src/contrib/underscore/'},
          {flatten: true, expand: true, src: ['bower_components/typeahead.js/dist/typeahead.bundle.min.js'], dest: 'src/contrib/typeaheadjs/'},
          {flatten: true, expand: true, src: ['bower_components/x2js/xml2json.min.js'], dest: 'src/contrib/x2js/'},
          {flatten: true, expand: true, src: ['bower_components/xregexp/min/xregexp-all-min.js'], dest: 'src/contrib/xregexp/'},
          {expand: true, cwd: 'bower_components/bootstrap', src: ['docs/assets/js/bootstrap.js', 'docs/assets/js/bootstrap.min.js', 'docs/assets/css/bootstrap.css', 'docs/assets/img/glyphicons-halflings.png', 'docs/assets/img/glyphicons-halflings-white.png'], dest: 'src/contrib/bootstrap/'},
          {expand: true, cwd: 'bower_components/fontawesome', src: ['**'], dest: 'src/contrib/fontawesome/'},
          {expand: true, cwd: 'bower_components/leaflet', src: ['**'], dest: 'src/contrib/leaflet/'},
          {expand: true, cwd: 'bower_components/openlayers', src: ['img/**/*', 'theme/**/*'], dest: 'src/contrib/openlayers/'},
          {expand: true, cwd: 'bower_components/proj4', src: ['**'], dest: 'src/contrib/proj4/'},
          {expand: true, cwd: 'bower_components/tipsy', src: ['**'], dest: 'src/contrib/tipsy/'},
          {expand: true, cwd: 'bower_components/web-socket-js', src: ['**'], dest: 'src/contrib/web-socket-js/'}
        ]
      }
    },
    /* jshint ignore:end */

    // after hooks are installed, they can still be ignored by passing the
    // option --no-verify
    githooks: {
      all: {
        'pre-commit': 'sasslint jshint',
        'pre-push': 'karma'
      }
    },

    // These are used to add latest tag when version bumping.
    gittag: {
      addLatest: {
        options: {
          tag: 'latest',
          message: 'Adding latest tag.'
        }
      },
      deleteLatest: {
        options: {
          tag: 'latest',
          remove: true
        }
      }
    },

    gitpush: {
      pushLatest: {
          options: {
            tags: true,
            force: true
          }
      }
    },

    gitfetch: {
      fetchTags: {
        all: true
      }
    },

    // 'pug:nsidc' used when the portal is built for
    // deployment; use '-dev' for local development
    pug: {
      options: {
        basedir: 'src',
        pretty: true
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
          'src/index-nsidc.html': ['src/templates/nsidc-index.pug'],
          'src/index.html': ['src/templates/nsidc-index.pug']
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
          'build/index.html': ['src/templates/nsidc-index.pug']
        }
      }
    },

    jshint: {
      all: runFiles.jshint,
      options: {
        jshintrc: '.jshintrc',
	reporterOutput: ''
      }
    },

    // NOTE: The following contrib libraries had to have an id inserted into their
    // js files so that requirejs wouldn't throw a fit about "anonymous" defines
    // not being matched
    //   - backbone
    //   - xregexp
    //   - jquery
    //   - bootstrap-dropdown
    //   - bootstrap-datepicker
    karma: {
      unit: {
        options: {
          basePath: '',
          frameworks: ['jasmine', 'requirejs', 'sinon', 'moment-2.9.0'],
          files: [
            // local scripts
            {pattern: 'spec/**/*_spec.js', included: false},
            {pattern: 'src/scripts/models/*.js', included: false},
            {pattern: 'src/scripts/**/*.js', included: false},
            {pattern: 'src/vendor/debug.js', included: false},
            {pattern: 'src/vendor/requirejs/text.js', included: false},
            {pattern: 'src/templates/**/*.html', included: false},
            {pattern: 'src/css/*.css', included: false},

            // Libraries
            'https://cdnjs.cloudflare.com/ajax/libs/openlayers/2.13.1/lib/OpenLayers.js',
            'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min.js',

            // local copy of the following due to requirejs "anonymous define" errors
            'src/contrib/backbone/backbone-1.4.0.js',
            'src/contrib/xregexp/xregexp-all-3.2.0.min.js',
            'src/contrib/sprintf/sprintf.min.js',
            'src/contrib/bootstrap/js/bootstrap-dropdown-3.2.0.min.js',
            'src/contrib/bootstrap/js/bootstrap-datepicker-1.9.0.min.js',

            // library with no CDN version
            'src/contrib/jasmine-jquery/jasmine-jquery-2.1.1.js',

            // local library
            'src/contrib/opensearchlight/OpenSearchlight.min.js',

            // Using a local tipsy because the one on CDN seems to be different and doesn't work right,
            // would need some test refactoring to work.
            'src/contrib/tipsy/javascripts/jquery.tipsy.js',

            'node_modules/jasmine-sinon/lib/*',

            {pattern: 'spec/test-main.js', included: true}
          ],
          exclude: [
          ],
          plugins: ['karma-jasmine', 'karma-requirejs', 'karma-sinon', 'karma-spec-reporter', 'karma-chrome-launcher', 'karma-moment'],
          // reporters: ['spec'],  // Use this if you want it to spit out a detailed list of all the tests
          port: 9876,
          colors: true,
          browsers: ['ChromeHeadless'],
          captureTimeout: 60000,
          singleRun: true,
          autoWatch: true,
          clearContext: false,
          // logLevel: 'DEBUG'
        }
      }
    },

    release: {
      options: {
        changelog: true,
        changelogText: '## <%= version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n\n',
        npm: false,
        npmtag: false,
        tagName: 'v<%= version %>'
      }
    },

    requirejs: {
      nsidc: {
        options: requirejsConf
      }
    },

    // 'sass:nsidc' used when the portal is built for
    // deployment; use 'sass:dev' for local development
    //
    // sass/ must have the same parent directory as css/ for sourcemaps to work;
    // when building for deployment, the requirejs optimizer first copies
    // src/sass/ to build/sass
    sass: {
      'dev': {
        files: {
          'src/css/nsidc-search.css': './src/sass/nsidc_main.scss'
        },
        options: sassConf
      },
      nsidc: {
        files: {
          'build/css/nsidc-search.css': 'build/sass/nsidc_main.scss'
        },
        options: sassConf
      }
    },

    sasslint: {
      options: {
        configFile: 'config/sass-lint.yml'
      },
      target: runFiles.sasslint
    },

    shell: {
      // --environment - one of 'integration', 'qa', 'staging'
      //
      // --project - 'arctic-data-explorer' or 'nsidc_search'
      cucumber: {
        command: [
          'URL=<%= url %>',
          'bundle exec cucumber spec/cucumber/features',
          '--tags @<%= project %>',
          '--format pretty',
          '-c',
          '-r spec/cucumber/features/support',
          '-r spec/cucumber/features/step_definitions',
          '-r spec/cucumber/features/page_objects',
        ].join(' ')
      },

      // --project=PROJECT - project name, must be 'arctic-data-explorer' or
      //     'nsidc_search'; build/ is deployed to /opt/$PROJECT
      //
      // --environment=ENV - environment being deployed, needed for the 'vagrant
      //     nsidc ssh' command
      deploy: {
        command: [
          'vagrant nsidc ssh --project=<%= project %> --env=<%= environment %>',
          '-c "sudo rm -rf /opt/<%= project %>; sudo cp -r /vagrant/build/ /opt/<%= project %>"'
        ].join(' ')
      },

      link_proj4js: {
        command: 'ln -s contrib/proj4js/defs build/defs'
      },

      updateTag: {
        command: [
          'git tag --force <%= project %>-<%= environment %>',
          'git push --force origin refs/tags/<%= project %>-<%= environment %>'
        ].join(' && ')
      }
    },

    watch: {
      'build-nsidc': {
        files: ['src/sass/**/*', 'src/templates/*.pug', 'Gruntfile.js'],
        tasks: ['build:nsidc-dev']
      },
      'sass': {
        files: ['src/sass/**/*'],
        tasks: ['sass:dev']
      },
      'lint-test': {
        files: Array.prototype.concat(
          watchFiles.jshint,
          watchFiles.sasslint,
          watchFiles.specs
        ),
        tasks: ['lint-test']
      },
      jshint: {
        files: watchFiles.jshint,
        tasks: ['jshint']
      },
      sasslint: {
        files: watchFiles.sasslint,
        tasks: ['sasslint']
      },
      specs: {
        files: watchFiles.specs,
        tasks: ['karma']
      }
    }
  });

  grunt.loadNpmTasks('grunt-available-tasks');
  grunt.loadNpmTasks('grunt-connect-proxy3');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-pug');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-sass-lint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-githooks');
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-karma');

  // build tasks for local development
  // build tasks allow NSIDC Search to be mounted at /data/search/ on your localhost
  //
  // build:nsidc-dev allows NSIDC Search to be mounted at /
  grunt.registerTask('build:nsidc-dev', ['clean:dev', 'pug:nsidc-dev', 'sass:dev']);

  // build tasks for deployment
  grunt.registerTask('build:nsidc', ['clean:build', 'requirejs:nsidc', 'shell:link_proj4js', 'pug:nsidc', 'sass:nsidc', 'clean:post-build']);
  grunt.registerTask('build:nsidc_search', 'build:nsidc');

  grunt.registerTask('lint-test', ['sasslint', 'jshint', 'karma']);
  grunt.registerTask('serve-tests', 'connect:spec:keepalive');
  grunt.registerTask('server', 'connect:site');

  grunt.registerTask('test:acceptance', 'shell:cucumber');
  grunt.registerTask('test:unit', ['sass:dev', 'karma']);

  grunt.registerTask('tasks', 'availabletasks:tasks');
  grunt.registerTask('deploy', 'shell:deploy');
  grunt.registerTask('updateTag', 'shell:updateTag');
  grunt.registerTask('tagLatest', ['gitfetch:fetchTags', 'gittag:deleteLatest', 'gitpush:pushLatest', 'gittag:addLatest', 'gitpush:pushLatest']);
  grunt.registerTask('default', ['lint-test']);
  grunt.registerTask('jasmine-server', ['jasmine:all:build', 'connect::keepalive']);
};
