## TODO

Modifications to create a webpack-bundled artifact are not yet complete. Refer
also to the notes in SOAC-62 (a clone of SRCH-28). Remaining work includes:

* The Arctic Data Explorer (ADE) has been decommissioned, and
  some ADE-specific code was removed as part of the work on SOAC-62/SRCH-28.
  The remaining references to ADE should be removed.
* Dataset Search Services (the Solr back end) is accessed via OpenSearchlight,
  an open source project owned by NSIDC. That project also needs to be migrated
  from `RequireJS` to ES6/webpack. Some initial experimentation with ES6-style
  code exists in branch `soac-62`. **The srch-28 branch of search-interface is
  running off of the OpenSearchlight branch soac-62, and uses a source file
  rather than a "built" file.** (See the `git` reference to
  OpenSearchlight in `package.json` and the `import` statement in
  `OpenSearchProvider.js`.). **This is not an acceptable long-term
  approach for a production application.** OpenSearchlight needs to be
  modernized or replaced. Note that OpenSearchlight is in the open source
  arena, but since we haven't been actively maintaining it I'm guessing
  there isn't a huge pool of current users.
* The acceptance and unit test environments need to be updated, and the
  old `Grunt` tasks should be replaced with `npm` tasks. Preferred test suite
  tools are Mocha, Chai, Sinon, and Jest.
* The Spatial Selection widget is not currently working. OpenLayers has
  been updated to the latest version in `package.json`, but the related
  code hasn't been modernized yet.
* The map thumbnails aren't being rendered correctly after updating the version
  of Leaflet used to generate those images (the overlay image is "zoomed in").
* Apropos of the previous two items: Unless there's a technical reason
  to use *both* Leaflet and OpenLayers, pick one!
* It appears that OpenLayers is pointing to an outdated Mapserver
  installation. The spatial search widget should be retrieving its base layer
  from the NSIDC GeoServer instance, or some other reliable OGC endpoint.
* The `tipsy` tooltip package is no longer being updated. I installed `tippy`
  in an effort to use something more current, as well as to move away from
  another `jQuery` dependency. The tooltips have been updated for the facet
  lists on the left side of the UI, but still need to be reinstated for the
  time fields.
* An updated `typeahead` package is now installed, but the existing code
  apparently needs some modification before it'll work.
* The `datepicker` widget still needs to be updated.
* Styling in general needs to be cleaned up. Moving to the most recent
  version of `Bootstrap.css` resulted in some dramatic changes; the
  application CSS will need to be reconciled with whatever parts of `Bootstrap.css`
  we want to use.
* The app still had a reference to "Crazy Egg Metrics." Are these still being
  maintained/used?
* Improve `estlint` configuration and tackle lint errors.
* Decommission `config/local_webserver_config.yaml` and `run_local_webserver.rb`.
  (Use `npm start` to run a local server.)
* The webpack configuration (and probably the code structure) need additional
  refinement in order to reduce the size of the bundled application.
* Update documentation (e.g. README and DEVELOPMENT files; software architecture diagrams)
  
### Longer term TODO
* Move to ES20xx or Typescript.
* Rewrite using React components?

## Git workflow

Development on this project uses
[the GitHub Flow](https://guides.github.com/introduction/flow/index.html):

1. Create your feature branch (`git checkout -b my-new-feature`)
2. Stage your changes (`git add`)
3. Commit your JSHint-compliant and test-passing changes (just run `grunt`) with a
   [good commit message](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
   (`git commit`)
4. Push to the branch (`git push -u origin my-new-feature`)
5. [Create a new Pull Request](https://github.com/nsidc/search-interface/compare)

## NSIDC Continuous Integration

NSIDC's project CI utilizes internal configuration found in the `*.yaml` files, `Vagrantfile`
and `/puppet/*`.   If you are utilizing this project external to NSIDC
you can safely ignore those files and the remainder of this section.

Most projects just have a file called `vagrant-nsidc.yaml`, which specifies a
`project` name for the plugin to use. This repository really has two projects,
`arctic-data-explorer` (formerly ade_search) and `nsidc_search`, configured in
`vagrant-nsidc.arctic-data-explorer.yaml` and `vagrant-nsidc.nsidc_search.yaml`.

To use the correct config file, set the appropriate environment variable:

```shell
export VAGRANT_NSIDC_YAML=vagrant-nsidc.arctic-data-explorer.yaml
```

If switching which project you are working on, take care that you are using the
correct config file, and that the temp file `.nsidc-project.yaml` references the
right project.

Once that is setup, machines can be provisioned as expected using the vagrant-nsidc
plugin.

## Installation

1. Install node.js. (See: http://nodejs.org/)
2. Install node modules:

        npm install

3. Build the application artifacts into the `dist` directory:

        npm run build
        npm run build:dev  # Build with source maps for development environment
                           # Update environment-dependent URL configurations in
                           # `src/config/appConfig.js` as needed.

4. Remove old build artifacts from `dist`:

        npm run clean

5. Start a local dev server at `http://localhost:8080`:

        npm start

6. Run linter

        npm run lint

7. Run tests (currently does nothing!):

        npm test

## Configuration

Host and endpoints for development, integration and production are configured in
`src/config/appConfig.js`.

## Running the app on a (dev) VM

Rsync the artifacts in `dist` to `vagrant@your-vm-name:/opt/nsidc-search`. For example:

    npm run build # or npm run build:dev
    rsync -av dist/ vagrant@dev.nsidc_search.DEVNAME.dev.int.nsidc.org:/opt/nsidc_search

The app should then be available at `http://dev.nsidc_search.DEVNAME.dev.int.nsidc.org`.

`nginx` is running as a service, and can be stopped/started/etc using the
system `service` command, e.g., `service nginx restart`.

`nginx` writes logfiles by default to `/var/log/nginx`; all logs should be in
this folder.

### External services

The external services used by the search portal are defined in
`local_webserver_config.yaml`. `search_proxies` are the default choice, and
contain endpoints for the services running on `localhost`. `integration_proxies`
and `qa_proxies` are also defined.

To run against services on integration:

```bash
./run_local_webserver.rb 8081 integration_proxies
```

To run against services on qa:

```bash
./run_local_webserver.rb 8081 qa_proxies
```

## Dependencies for unit and acceptance tests

* Ruby
* Rubygems and bundler

Install the ruby gems: `bundle install`

## Running the acceptance tests locally (TODO: Update to use npm tasks for testing)

Prerequisites

* Firefox
* If using the development VM under Mac OS X,
  [XQuartz](http://xquartz.macosforge.org/landing/) is required.

To run the acceptance tests on your machine from the
[development VM](https://bitbucket.org/nsidc/dev-vm-search), you will first need
to ssh with X windowing enabled. Instead of connecting with `vagrant ssh`, use
`ssh -X vagrant@127.0.0.1 -p 2222`.

```shell
grunt test:acceptance --project=arctic-data-explorer --environment=integration
```

`project` can be `arctic-data-explorer` or `nsidc_search`

`environment` can be `integration`, `qa`, or `staging`.

The URL used by Cucumber is built from `project` and `environment`. To test
against a different URL (like when running the tests locally), specify with a
`--url` flag (`project` must still be specified):

```shell
grunt test:acceptance --url=http://localhost:8081 --project=arctic-data-explorer
```

## CSS / Sass

* The structure of our [Sass](http://sass-lang.com/) code is as follows:
    * `src/sass`
        * `_config_*.scss`
            * contains different variable definitions to separate styles across
              projects built from the common codebase
        * `*_main.scss`
            * imports the configuration and modules for that project
        * `modules/`
            * a Sass module defines the styling for a specific part of the page;
              keeping our code more modular makes it easier to identify places
              where it can be shared across projects, and makes it easier to
              find a particular selector you are interested in modifying or
              investigating
        * `utilities/`
            * our own custom Sass functions; no CSS rules are defined in here
        * `junk/`
            * old, monolithic CSS files converted to Sass syntax still needing
              cleanup (break into smaller parts, put those parts in `modules/`)
* `grunt sass:dev` generates `src/css/ade-search.css` and
  `src/css/nsidc-search.css`, combining the project-specifc scss and the common
  files into one
* `grunt sass:$PROJECT` generates `tmp/css/$PROJECT-search.css`; this is used by
  `grunt build:$PROJECT` (see the Build section)
* `grunt sass` is configured to compress the generated CSS files and generate
  source maps, allowing tools like the Chrome Inspector to automatically show
  line numbers from the original Sass files
* `grunt scsslint` runs the [scss-lint](https://github.com/causes/scss-lint)
  tool on the Sass files. It is configured by rules in `config/scss-lint.yml`
  (with additional rules that should be cleaned up in
  `config/scsslint-todo.yml`)

## Unit tests

***NOTE: Look for the keyword TODO: SKIPPED, to see some tests that are being
skipped for now because they are failing intermittently.  Need to investigate.***

Run the unit tests using Karma in HeadlessChrome with `grunt
karma`. Test code is located in `spec/`, written in
[Jasmine 1.3](http://jasmine.github.io/1.3/introduction.html) along with
[Sinon](http://sinonjs.org/). 

Note that running these tests locally may result in failure. If so, try running
the unit tests in a browser (discussed below).  Make sure unit tests pass in the
browser and in Travis CI before merging any code with master.

It can helpful for debugging purposes to run the unit tests in a browser. To do
so, follow these steps:

* if you don't already have the file `_SpecRunner.html`, run `grunt test:unit`
  to generate the file
* make sure your port 8081 is open (kill the local webserver if you are
  running it)
* `grunt serve-tests`
* point your browser to
  [localhost:8081/_SpecRunner.html](localhost:8081/_SpecRunner.html)

## JSHint

Run with `grunt jshint`. Run automatically whenever a JavaScript file is changed
with `grunt watch:jshint`.

JSHint is configured in `.jshintrc`, a JSON file containing a list of options
and allowed global variables.

* [Official documentation for JSHint configuration options](http://www.jshint.com/docs/options/)
* [Grunt task for JSHint](http://www.github.com/gruntjs/grunt-contrib-jshint)
* [JSHint in Emacs with flycheck](https://github.com/flycheck/flycheck)
* [plugins to run JSHint in various editors and IDEs](http://www.jshint.com/install/#plugins)

## RuboCop

The acceptance tests use the official
[Ruby implementation of Cucumber](https://github.com/cucumber/cucumber-ruby),
and we use the tool [RuboCop](https://github.com/bbatsov/rubocop) to lint the
Ruby code contained within this project. After installing the gems listed in
`Gemfile` with `bundle install`, RuboCop can be run with `bundle exec
rubocop`. Settings can be found in `.rubocop.yml`.

## Git Hooks

Our build server attempts to build the project with every revision, and it
requires that linters and unit tests pass successfully. To protect yourself from
the embarrassment of breaking the build, git hooks can be set up to run
everything on your local box before you push.

Git hooks are configured in `Gruntfile.js` with the `grunt-githooks`
plugin. Running `grunt githooks` udpates files in your `.git/hooks/` so that the
specific grunt tasks will be run at the given git events. This means if the
githooks task configuration is ever changed, you will need to run `grunt
githooks` again to update your hook scripts (and if a hook is removed the
Gruntfile configuration, you may need to delete the old script from
`.git/hooks/`).

Currently included hooks (and the tasks they run) are:

* `pre-commit`: `scsslint` and `jshint`
* `pre-push`: `jasmine`

## Bootstrap

We are using a customized version of Bootstrap to avoid conflicts with global
NSIDC styles included via SSI. To add to the existing set of styles and scripts
go to Bootstrap's
[customize page](http://getbootstrap.com/2.3.2/customize.html).

To generate the download, first deselect all items in the "Choose components"
and "Select jQuery plugins" sections.

In "Choose components" select the following:

* Base CSS
    * Buttons
* Componets
    * Button groups and dropdowns
    * Alerts
* JS Components
    * Dropdowns

In "Select jQuery plugins" select the following:

* Dropdowns
* Buttons

Replace the `src/contrib/bootstrap/` directory with the contents of the
downloaded zip file. Be sure to update this list of components after each new
download.

## Releases

The version in `package.json` is updated automatically with the `grunt
release:$part` task (where `$part` is `patch`, `minor`, or `major`). This task
creates a git tag for the new version, and adds 2 new header lines to
`CHANGELOG.md`, indicating the version number and the date it was
released. Note that no `## Unreleased` place-holder line is necessary at the top of the
`CHANGELOG.md` file. Simply add a description of changes at the beginning of `CHANGELOG.md`
and the release version and date will be inserted when the version is `bump`-ed.

## Other gotchas

### Node "circular dependency" warnings
When running some of the Grunt tasks, you may see some warning output like:

    (node:29680) Warning: Accessing non-existent property 'cat' of module exports inside circular dependency
    (Use `node --trace-warnings ...` to show where the warning was created)
    (node:29680) Warning: Accessing non-existent property 'cd' of module exports inside circular dependency
    (node:29680) Warning: Accessing non-existent property 'chmod' of module exports inside circular dependency
    (node:29680) Warning: Accessing non-existent property 'cp' of module exports inside circular dependency

This is apparently being emitted by the `shelljs` package in the Node 14+ context.
To see more details and confirm the source set the `NODE_OPTIONS` environment variable
to include `--trace-warnings`. For example:

    NODE_OPTIONS="--trace-warnings" grunt test:unit

### Xvnc password failure in acceptance tests

If acceptance tests are failing with a warning about an invalid Xvnc password,
run `vncpasswd` on the machine running the tests and set a dummy password
(password value doesn't matter).
