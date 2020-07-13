[![Build Status](https://travis-ci.org/nsidc/search-interface.svg)](https://travis-ci.org/nsidc/search-interface)

# NSIDC Search Portal

Note: Arctic Data Explorer (ADE) has been decommissioned.

An Opensearch-based single page search interface

### OPS Configuration Information

    The portal is a javascript app being served via nginx
    (http://wiki.nginx.org/Main)

    nginx configuration files are located at /etc/nginx
    nginx is running as a service, and can be stopped/started/etc using the
    system "service" command, e.g., "service nginx restart"

    The portal code is being served from /usr/share/nginx/portal/, which is where
    the artifact deploys when the VM is provisioned.

    nginx writes logfiles by default to /var/log/nginx, all logs should be in
    this folder.

### Prerequisites:

* [Node](http://nodejs.org/) (includes [npm](https://www.npmjs.org/))
* [Grunt](http://gruntjs.org) - `sudo npm install -g grunt-cli`
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
