module.exports = function (grunt) {

  var urlPath,
      requirejsConf,
      runFiles,
      sassConf,
      watchFiles;

  urlPath = {
    ade_search: '/acadis/search',
    nsidc_search: '/data/search'
  };

  requirejsConf = {
    appDir: '/base/src/',
    dir: '/base/build/',
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
      templates: 'templates/underscore',
      vendor: '../vendor',

      bootstrap: '../contrib/bootstrap/js',
      jasmine_jquery: '../contrib/jasmine-jquery',
      jasmine_sinon: '../contrib/jasmine-sinon',
      jquery_tipsy: '../contrib/tipsy/javascripts',
      moment: '../contrib/moment',
      openlayers: '../contrib/openlayers',
      opensearchlight: '../contrib/opensearchlight',
      require_mocking: 'src/scripts/lib',
      sinon: '../contrib/sinon/sinon.min',
      typeahead: '../contrib/typeahead',
      xregexp: '../contrib/xregexp'
    },
    preserveLicenseComments: false,
    shim: {
      'vendor/debug': {
        exports: 'debug'
      }
    },
    files: [
      {pattern: 'spec/test-main.js', included: true}
    ]
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
    // sourcemap: true,
    style: '<%= environment === "development" ? "expanded" : "compressed" %>',
    // lineNumbers: '<%= environment === "development" %>'
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
    project: grunt.option('project'),
    urlPath: urlPath[grunt.option('project')],
    url: grunt.option('url') || 'http://<%= environment %>.nsidc.org/<%= urlPath %>',

    availabletasks: {
      tasks: {
        options: {
          filter: 'include',
          tasks: [
            'build:ade-dev',
            'build:arctic-data-explorer',
            'build:nsidc-dev',
            'build:nsidc_search',
            'default',
            'deploy',
            'githooks',
            'jshint',
            'release',
            'scsslint',
            'serve-tests',
            'tasks',
            'test:acceptance',
            'test:unit',
            'updateTag'
          ],
          groups: {
            'Build for Development': ['build:ade-dev', 'build:nsidc-dev'],
            'Deployment/Release': ['build:arctic-data-explorer', 'build:nsidc_search', 'deploy', 'release', 'updateTag'],
            'Miscellaneous': ['default', 'githooks', 'tasks'],
            'Syntax': ['scsslint', 'jshint'],
            'Tests': ['test:acceptance', 'test:unit', 'serve-tests']
          },
          descriptions: {
            'build:ade-dev': 'Compile Jade to HTML and Sass to CSS into src/ for ADE.',
            'build:nsidc-dev': 'Compile Jade to HTML and Sass to CSS into src/ for NSIDC Search.',
            'build:arctic-data-explorer': 'Compile Jade and Sass, minify JavaScript into build/ for ADE. [--environment]',
            'build:nsidc_search': 'Compile Jade and Sass, minify JavaScript into build/ for NSIDC Search. [--environment]',
            'default': 'Run syntax checkers and unit tests.',
            'deploy': 'Copy build/ to /opt/$project on a VM [--environment --project]',
            'release': 'Bump version, update CHANGELOG.md, git tag, git push.',
            'serve-tests': 'Run unit tests (for debugging) in a browser with a connect web server.',
            'tasks': 'List available Grunt tasks & targets.',
            'test:acceptance': 'Run Cucumber features. [--environment --project]',
            'test:unit': 'Run jasmine specs headlessly through PhantomJS.',
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
        'pre-commit': 'scsslint jshint',
        'pre-push': 'jasmine'
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

    // 'jade:ade' and 'jade:nsidc' used when the portal is built for
    // deployment; use '-dev' for local development
    jade: {
      options: {
        basedir: 'src',
        pretty: true
      },
      'ade-dev': {
        options: {
          data: {
            environment: '<%= environment %>',
            project: 'ADE',
            title: 'Arctic Data Explorer',
            version: '<%= pkg.version %>'
          }
        },
        files: {
          'src/index-ade.html': ['src/templates/ade-index.jade'],
          'src/index.html': ['src/templates/ade-index.jade']
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
      ade: {
        options: {
          data: {
            environment: '<%= environment %>',
            project: 'ADE',
            title: 'Arctic Data Explorer',
            version: '<%= pkg.version %>'
          }
        },
        files: {
          'build/index.html': ['src/templates/ade-index.jade']
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
          'build/index.html': ['src/templates/nsidc-index.jade']
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

    karma: {
      unit: {
        options: {
          basePath: '',
          frameworks: ['jasmine', 'requirejs', 'sinon'],
          files: [
            'src/contrib/jquery/jquery.min.js',
            'src/contrib/underscore/underscore-min.js',
            'src/contrib/backbone/backbone.js',
            {pattern: 'src/contrib/**/*.js', included: false},
            {pattern: 'src/contrib/**/*.map', included: false},
            {pattern: 'spec/collections/*_spec.js', included: false},
            {pattern: 'src/scripts/**/*.js', included: false},
            {pattern: 'src/vendor/debug.js', included: false},
            {pattern: 'spec/test-main.js', included: true},
          ],
          exclude: [],
          preprocessors: {},
          reporters: ['progress'],
          port: 9876,
          colors: true,
          browsers: ['ChromeHeadless'],
          captureTiemout: 600000,
          singleRun: true,
          autoWatch: true,
          clearContext: false
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
      ade: {
        options: requirejsConf
      },
      nsidc: {
        options: requirejsConf
      }
    },

    // 'sass:ade' and 'sass:nsidc' used when the portal is built for
    // deployment; use 'sass:dev' for local development
    //
    // sass/ must have the same parent directory as css/ for sourcemaps to work;
    // when building for deployment, the requirejs optimizer first copies
    // src/sass/ to build/sass
    sass: {
      'dev': {
        files: {
          'src/css/ade-search.css': 'src/sass/ade_main.scss',
          'src/css/nsidc-search.css': 'src/sass/nsidc_main.scss'
        },
        options: sassConf
      },
      ade: {
        files: {
          'build/css/ade-search.css': 'build/sass/ade_main.scss'
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

    scsslint: {
      all: runFiles.scsslint,
      options: {
        bundleExec: true,
        config: 'config/scss-lint.yml'
      }
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
      'build-ade': {
        files: ['src/sass/**/*', 'src/templates/*.jade', 'Gruntfile.js'],
        tasks: ['build:ade-dev']
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

  grunt.loadNpmTasks('grunt-available-tasks');
  grunt.loadNpmTasks('grunt-connect-proxy3');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-githooks');
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-scss-lint');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-karma');

  // build tasks for local development; note that both projects are built
  //
  // both build tasks allow NSIDC Search to be mounted at /data/search/ and
  // ADE to be mounted at /acadis/search/ on your localhost
  //
  // build:nsidc-dev allows NSIDC Search to be mounted at /
  // build:ade-dev allows ADE to be mounted at /
  grunt.registerTask('build:ade-dev', ['clean:dev', 'jade:nsidc-dev', 'jade:ade-dev', 'sass:dev']);
  grunt.registerTask('build:nsidc-dev', ['clean:dev', 'jade:ade-dev', 'jade:nsidc-dev', 'sass:dev']);

  // build tasks for deployment
  grunt.registerTask('build:ade', ['clean:build', 'requirejs:ade', 'shell:link_proj4js', 'jade:ade', 'sass:ade', 'clean:post-build']);
  grunt.registerTask('build:nsidc', ['clean:build', 'requirejs:nsidc', 'shell:link_proj4js', 'jade:nsidc', 'sass:nsidc', 'clean:post-build']);
  grunt.registerTask('build:arctic-data-explorer', 'build:ade');
  grunt.registerTask('build:nsidc_search', 'build:nsidc');

  grunt.registerTask('lint-test', ['scsslint', 'jshint', 'jasmine']);
  grunt.registerTask('serve-tests', 'connect:spec:keepalive');
  grunt.registerTask('server', 'connect:site');

  grunt.registerTask('test:acceptance', 'shell:cucumber');
  grunt.registerTask('test:unit', ['jasmine']);
  grunt.registerTask('test:unit2', ['karma']);

  grunt.registerTask('tasks', 'availabletasks:tasks');
  grunt.registerTask('deploy', 'shell:deploy');
  grunt.registerTask('updateTag', 'shell:updateTag');
  grunt.registerTask('tagLatest', ['gitfetch:fetchTags', 'gittag:deleteLatest', 'gitpush:pushLatest', 'gittag:addLatest', 'gitpush:pushLatest']);
  grunt.registerTask('default', ['lint-test']);


  grunt.registerTask('jasmine-server', ['jasmine:all:build', "connect::keepalive"]);
};
