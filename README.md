[![CircleCI](https://circleci.com/gh/nsidc/search-interface.svg?style=shield&circle-token=7bed4ba6e1b72640be27b0b80a4a5b3d4622695c)](https://circleci.com/gh/nsidc/search-interface)

# NSIDC Search Portal

An Opensearch-based single page search interface.

## ES2015 (ES6) transition:

Branch `v4.0.0-rc` represents work in progress to switch from `RequireJS` to
ES6-style code structure, including the use of `npm` and `webpack` to manage
dependencies and build a deployable artifact (i.e. bundle). See
[`DEVELOPMENT.md`](DEVELOPMENT.md) for additional details regarding the work
remaining to finish this effort.

### OPS Configuration Information

Upon completion of `soac-28` and related stories, the portal will be deployed by loading a
bundle created by Webpack into a Drupal context (i.e. including the bundle in an HTML document
managed by Drupal).

### On dev VM

Run a standalone version of the application by building a VM using the `soac-webapp-vm` configuration.
The application is served by `nginx` running as a service on the VM.
`nginx` can be stopped/started/etc using the system `service` command, e.g., `service nginx restart`.

`nginx` writes logfiles by default to `/var/log/nginx`; all logs should be in
this folder.

### Prerequisites:

* [Node](http://nodejs.org/) (includes [npm](https://www.npmjs.org/))
* Install the ruby gems - `bundle install`
* Install the npm modules - `npm install`

### Project Dependencies

The search portal requires some external services to be active. The local
webserver can be configured to use public URLs from the internet or URLs under
`localhost` to access services running locally (see more under "External
services"). To have the full stack of NSIDC applications running locally, you
will need to have these projects running/availalble on your infrastructure.

* [Dataset Search Services](https://github.com/nsidc/dataset-search-services/)
* [Dataset Catalog Services](https://bitbucket.org/nsidc/dataset-catalog-services/)
* [NSIDC Solr](https://github.com/nsidc/search-solr)

### Development notes

See
[`DEVELOPMENT.md`](https://github.com/nsidc/search-interface/blob/master/DEVELOPMENT.md).

### How to contact NSIDC

User Services and general information:
Support: http://support.nsidc.org
Email: nsidc@nsidc.org

Phone: +1 303.492.6199
Fax: +1 303.492.2468

Mailing address:
National Snow and Ice Data Center
CIRES, 449 UCB
University of Colorado
Boulder, CO 80309-0449 USA

### License

Every file in this repository is covered by the GNU GPL Version 3; a copy of the
license is included in the file COPYING.

### Citation Information

Andy Grauch, Brendan Billingsley, Chris Chalstrom, Danielle Harper, David Grant,
Hannah Wilcox, Ian Truslove, Jonathan Kovarik, Kevin Beam, Luis Lopez, Matt
Savoie, Miao Liu, Michael Brandt, Scott Lewis, Stuart Reed, Teri Hoyer (2013):
Arctic Data Explorer Portal / NSIDC Search Portal. The National Snow and Ice
Data Center. Software. http://ezid.cdlib.org/id/doi:10.7265/N55H7D75
