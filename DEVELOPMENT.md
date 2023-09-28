# Contents

* [ES2015 Transition](#es2015-transition)
* [Dependencies and Prerequisites](#dependencies-and-prerequisites)
* [Git Workflow](#git-workflow)
* [Installation](#installation)
* [Configuration](#configuration)
* [Running the Linter](#running-the-linter)
* [Running the App Locally](#running-the-app-locally)
* [Running on a VM](#running-on-a-vm)
* [Unit Tests](#unit-tests)
* [Acceptance Tests](#acceptance-tests)
* [Continuous Integration](#continuous-integration)
* [Releasing a New Version](#releasing-a-new-version)
* [Miscellaneous Development Notes](#miscellaneous-development-notes)

# Notes on ES2015 transition:

The application was migrated from using `Bower`, `Grunt` and `requirejs`
to a structure following the ES2015 language
specification, using `npm` to manage dependencies and `webpack` to build
and bundle the application. The migration strategy was based on the "Treat
everything like a method" option described by
[Ben McCormick](https://benmccormick.org/2015/07/06/backbone-and-es6-classes-revisited).

## Dependencies and prerequisites

* [Node](http://nodejs.org/) and [npm](https://www.npmjs.org/)
* An OpenSearch endpoint capable of receiving search queries and returning
  search results and related facets.

[Dataset Search Services](https://github.com/nsidc/dataset-search-services/)
provides the OpenSearch endpoint in the NSIDC environment. See the DSS
project to learn more about its dependencies, including Solr and Search Solr Tools.
A local DSS, DSS running in a pre-production environment (e.g., `integration`,
`qa`, or `staging`), or the production version of DSS may be used as the
OpenSearch endpoint when running a local instance.  See [Configuration](#configuration), below.

# Git Workflow

Development on this project uses
[the GitHub Flow](https://guides.github.com/introduction/flow/index.html):

1. Create your feature branch (`git checkout -b my-new-feature`)
2. Stage your changes (`git add`)
3. Commit your ESLint-compliant (`npm run lint`) and test-passing changes
   (`npm test`) with a
   [good commit message](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
   (`git commit`)
4. Push to the branch (`git push -u origin my-new-feature`)
5. [Create a new Pull Request](https://github.com/nsidc/search-interface/compare)

# Installation

1. Install [node.js](http://nodejs.org/) (Check out [NVM](https://github.com/nvm-sh/nvm)
   if you need to move between versions of node for different projects.)

2. Install node modules:

        npm install

# Configuration

The Dataset Catalog Services endpoint is configured in `src/config/appConfig.js`.
**Caveat:** The pre-production DSS instances aren't created with valid
SSL certificates, so attempts to use those endpoints currently fail.

# Running the Linter

Run once with `npm run lint`. Run automatically whenever a JavaScript file is changed
with `npm run lint:watch`.

ESLint is configured in `.eslintrc.json`, a JSON file containing a list of options
and allowed global variables.

* [Official documentation for ESLint configuration ](https://eslint.org/docs/user-guide/configuring/)
* [plugins to run ESLint in various editors and IDEs](https://eslint.org/docs/user-guide/integrations#editors)

# Running a dev instance of the app

There are currently two ways to run a development instance of this app: running it locally
or deploying to a developer Drupal instance.  The ability to deploy to a developer VM
directly using puppet has been deprecated and removed.

## Running the App Locally

Run a local server instance at `http://localhost:8080`:

        npm start

By default, the local server will set the environment to `development`, and will
use the production OpenSearch endpoints. See the OpenSearch endpoint configuration
in `src/config/appConfig.js`.

## Deploying to a developer Drupal VM

**Note: As of August 2023 a bug associated with Drupal OS updates is preventing new VM builds.**

Ansible and Garrison are used to deploy a new Drupal VM. The relevant repositories are:

1. [ansible_drupal_nsidc_org](ssh://gitsrv.nsidc.org/gitsrv/webteam/ansible_drupal_nsidc_org.git))
   Note that this project is hosted in a private, local git repository.

2. If you need to modify the version of `search-interface` installed from `npmjs.com`:
   [nsidc-drupal8](https://bitbucket.org/nsidc/nsidc-drupal8/src/staging/), specifically
   file `web/libraries/package.json`.

Build steps:

1. Check out the `ansible_drupal_nsidc_org` project.
2. Get a copy of the Drupal database as described in the Ansible Drupal project
   README.md file.
3. Follow the dev environment instructions in the "Deploy using garrison" section.
   The VM will be provisioned with the version of `search-interface` specified in the
   `nsidc-drupal8` project `staging` branch, in file `web/libraries/package.json`.
4. Access the application on the resulting VM at:

        http://dev.nsidc.org.docker-drupal8.USERNAME.dev.int.nsidc.org/data/search

   Replace `USERNAME` with your LDAP username. Note that on the dev VM, some external
   images may not render.

### Building a developer Drupal VM with a different `npmjs.com` version of `search-interface`

If you've published a new version of `search-interface` to `npmjs.com` and want to build a
Drupal VM using that new version, create a temporary branch in the `nsidc-drupal8` project
and modify the `web/libraries/package.json` file to specify your desired version. Commit
the branch changes. Then change the **Deploy using garrison** step in the VM build process
that looks like:

    vagrant nsidc ssh --no-tty --env=dev -c "/vagrant/local_garrison.sh -e staging -r staging"

to instead use your branch name:

    vagrant nsidc ssh --no-tty --env=dev -c "/vagrant/local_garrison.sh -e my-new-branch -r my-new-branch"

Note that this option is for testing `search-interface` changes that have been published
to `npmjs.com`. See the next section if you need to test `search-interface` changes that
have not yet been published to `npmjs.com`.

### Redeploying to an existing developer Drupal VM

If you want to deploy a work-in-progress `search-interface` package to an existing
dev Drupal VM, copy the `index.bundle.js` file to your dev Drupal machine as described below.

    # Update the contents of search-interface/dist
    cd /path-to-your-workspace/search-interface
    npm run build # Or npm run build:dev if you want source maps for debugging

    # Copy the updated index.bundle.js. Also copy the source map file, if you did
    # "npm run build:dev" in the step above.
    cd /path-to-your-workspace/ansible_drupal_nsidc_org
    scp /path-to-your-workspace/search-interface/dist/index.bundle.js dev.nsidc.org.docker-drupal8.USERNAME.dev.int.nsidc.org:/home/vagrant/drupal/web/libraries/node_modules/@nsidc/search-interface/dist/index.bundle.js

    vagrant nsidc ssh --no-tty --env=dev -c "cd /home/vagrant/drupal; lando drush cache:rebuild"

NOTE: The last step may not strictly be necessary, but if copying the file doesn't cause
the application to be updated, the `lando drush...` should refresh everything.

# Unit Tests

Prior to the ES2015 update, unit tests were implemented using a grunt task, Karma,
and a HeadlessChrome environment. A few unit tests have already been migrated to
Jest, and are explicitly executed via the `Test` configuration in `.circleci/config.yml`
and the `test` and `test:watch` script definitions in `package.json`.
The remaining tests are now obsolete and need to be migrated to `Jest`. See Jira stories
PSS-460 for some history and SRCH-76 for proposed work.

# Acceptance Tests (currently not usable)

**TODO**: Migrate from Ruby-based tests to JS-based acceptance tests if
possible, and replace outdated `grunt` tasks with `npm tasks` to run the
acceptance test suite. The tests themselves haven't been updated to the ES2015
language specification, and are currently not usable.
See Jira stories SRCH-73 and related stories SRCH-41, SRCH-50.

## Prerequisites

The acceptance tests use the official
[Ruby implementation of Cucumber](https://github.com/cucumber/cucumber-ruby),
and we use the tool [RuboCop](https://github.com/bbatsov/rubocop) to lint the
Ruby code contained within this project. After installing the gems listed in
`Gemfile` with `bundle install`, RuboCop can be run with `bundle exec
rubocop`. Settings can be found in `.rubocop.yml`.

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

# Continuous Integration

CircleCI is configured to run `eslint` and tests automatically when changes are committed
to the repository. See the configuration in `.circleci/config.yml`

## Running CircleCI locally

You can run the CircleCI job(s) in your local workspace to confirm all steps pass
before committing any changes. The steps are:

* Install the CircleCI CLI.
* Ensure Docker is running.
* `circleci config process .circleci/config.yml > process.yml`
* `circleci local execute -c process.yml test`

See [The CircleCI documentation](https://circleci.com/docs/local-cli/) for more information.

# Releasing a New Version

**Tl;dr: Adding a version tag to a branch in the format `vNN.NN.NNN` (or `vNN.NN.NN-rc.NN`, in
the case of release candidates) will package and publish that commit to
[npmjs.com](https://www.npmjs.com)!**

See also **Version Handling** below.

In brief, the steps are:

1. Confirm all tests pass, and that all changes have been committed and pushed
   to origin. Include a `CHANGELOG` entry with the text `Unreleased` instead of a
   version number and date.
2. Merge the feature branch into the main branch. Update your local working directory.

        git checkout main && git pull

3. Bump the desired semver field (major, minor, patch), tag the main branch with the
   updated version number, and push changes to origin.

        npm run release -- [major | minor | patch ]

## Version Handling

Versions should follow [Semantic Versioning](https://semver.org) guidelines.
Adding a version tag to a branch in the format `vNN.NN.NNN` (or `vNN.NN.NN-rc.NN`, in
the case of release candidates) will package and publish that commit to
[npmjs.com](https://www.npmjs.com).

## Tagging release candidates

Note: The naming structure for the prerelease scripts (`setup:prerelease` and `bump:prerelease`)
are intentional in order to avoid unnecessarily triggering the `release` script.

       $ npm run setup:prerelease # Adds an initial pre-release tag to the current branch (e.g. v3.3.0-rc.0)
                                  # Does not tag the branch. You'll need to push changes to git after running this step.
       $ npm run bump:prerelease # Bumps the prerelease number (e.g. 3.3.0-rc.1) and tags the branch.

Running `npm run bump:prerelease` will tag the current branch with an updated release candidate
version, the tag will be pushed to origin (via the `postversion` trigger), and CircleCI will build
and publish a new package to `npmjs`.

## Tagging releases

To add a release tag (no `-rc.N` suffix):

        npm run release -- [major | minor | patch ]

The `release` script noted above is a shortcut for the built-in `npm version` command.
Note the ` -- ` (two dashes surrounded by spaces) before the level specification. You can also do:

        npm version [major | minor | patch ]

`npm run release -- ...` will tag the current branch, the tag will be pushed to origin (via the
`postversion` trigger), and CircleCI will build and publish a new package to `npmjs`.

## Deploying to staging and production Drupal

At a minimum, developers will need to create a PCT when a new version
is deployed to [npmjs.com](https://www.npmjs.com). Depending on the changes,
a pull request may also need to be submitted to update files in
[nsidc-drupal8](https://bitbucket.org/nsidc/nsidc-drupal8/src/staging/)
(e.g. `web/libraries/package.json`).


# Miscellaneous Development Notes

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
  `src/css/nsidc-search.css`, combining the project-specific scss and the common
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

## Node "circular dependency" warnings
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

## Xvnc password failure in acceptance tests

If acceptance tests are failing with a warning about an invalid Xvnc password,
run `vncpasswd` on the machine running the tests and set a dummy password
(password value doesn't matter).

## A Tale of Exports and Imports

Apparently NodeJS has added a new thing in package.json called "exports". A
package author can use this section to declare what things are exported for use,
and a map to where they are located in the package directory.

Webpack 5 now enforces this--if you attempt to import something which is not
declared as exported from the package it is in, the import will fail. A package
which omits the "exports" section defaults to everything being exported /
importable. A package which includes the "exports" section only exports things
listed, nothing else.

This has the following side-effect:
* Your code imports "foo" from package X
* Your code imports "bar" from package Y
* Package X has no "exports" section because the author(s) didn't know about this new feature
* Package Y does have an exports section, but it does not export "bar" (possibly because they didn't understand this new feature)
* Using webpack 4 is no problem, both imports work
* Upgrading to webpack to v5 results in the import of "foo" succeeding and the import of "bar" failing

In our case we were successfully importing CSS from vanillajs-datepicker, but
when upgrading webpack to v5, the build started raising a new error indicating
that the CSS could not be imported because the package (vanillajs-datepicker)
did not export it.

A workaround in the webpack config which bypasses the export / import rules:

```
resolve: {
  alias: {
    'vjs-datepicker': path.resolve(__dirname, 'node_modules/vanillajs-datepicker/dist/css')
  }
}
```

which allows the import of this form to work (currently used in `TemporalCoverageView`):

```
import 'vjs-datepicker/datepicker-bs4.css';
```

If / when the vanillajs-datepicker package updates their exports to export this CSS, we can change the import back to:

```
import 'vanillajs-datepicker/dist/css/datepicker-bs4.css';
```
