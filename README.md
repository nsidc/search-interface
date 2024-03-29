Build status for `main`: [![CircleCI](https://dl.circleci.com/status-badge/img/gh/nsidc/search-interface/tree/main.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/nsidc/search-interface/tree/main)

# NSIDC Search Portal

An OpenSearch-based single page search interface.

See the [CHANGELOG](/CHANGELOG.md) for details regarding recent application
changes.

### Prerequisites:

* [Node](http://nodejs.org/) and [npm](https://www.npmjs.org/)
* An OpenSearch endpoint capable of receiving search queries and returning
  search results and related facets. Configure the desired endpoint for the
  relevant environment in `src/config/appConfig.js`.

### Development notes

See [`DEVELOPMENT.md`](https://github.com/nsidc/search-interface/blob/main/DEVELOPMENT.md).

### How to contact NSIDC

User Services and general information:

  - Email: nsidc@nsidc.org
  - Phone: +1 303.492.6199
  - Fax: +1 303.492.2468

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
Data Center. Software. https://doi.org/10.7265/N55H7D75
