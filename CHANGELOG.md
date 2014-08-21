## 1.7.0
- A reset link has been added next to the search button to reset the users search. (new for NSIDC, functions differently than ADE reset link)
- Facet bookmarking works with special character facets.
- A spatial map with mouseover coordinates has been added. This also included significant styling changes to the results. (new for NSIDC)
- A bug that had results load in the home page view when using the browser navigation arrows has been fixed.
- Datasets with multiple date ranges now have the ranges displayed in chronological order.
- For some NSIDC datasets, the Get Data dropdown includes a "Product Web Site" link. (example: ELOKA002)
- Fixed bug for ADE where reset link was not working.

## 1.6.0
- Facet searches can now be bookmarked
- URL parameters have been changed; old URLs still work, but any new URLs retrieved from a search will be different
    - "p" is now "pageNumber"
    - "psize" is now "itemsPerPage"
    - "bbox" is now "osGeoBbox"

## 1.5.0
- Updates to app home page
    - newer, larger ACADIS logo
    - number of records available from each data center is listed and clickable to start a search for those records
    - "Examples of Arctic Data" at bottom are now links to searches
- Replace "Cancel Search" button with status messages about the search
- Upgrade Backbone.js
- Changed calendar widget for selecting start and end dates to a new widget
- Improved harvest reliability
- Improved speed of map thumbnail with results
- Fixed IE9 problem where the map thumbnail base layer was not rendered

## 1.4.4
- OpenSearch responses now contain a link for obtaining a dataset by id
- Ability to sort by spatial coverage
- Facet Spatial Scope replacing Spatial Coverage in the ADE
- New source ECHO now available
- Fixed bug when doing a keyword search containing parenthesis inside quoted phrases
- Added 'no spatial information' to the Spatial Coverage facet

## 1.4.3
- New sources NODC and RDA now available
- Removed the author facet due to length
- Keyword search using parenthesis inside quotes now returns correct results
- Added 'no spatial information' to the Spatial Duration facet

## 1.4.2
- Sort datasets by 'Longest/Shortest duration'
- Updated homepage text
- Improved styling for datasets with no data links
- Added RDA as a new data source
- Added 'no temporal information' to the Temporal duration facet

## 1.4.1
- Sort data sets by the 'Last Updated' field in addition to relevance
- Updated home page text and contact information
- Removed data center names that were showing up as Author facets
- Condensed Data Center names into acronyms in the facet list and hover text shows full name
- Show all button for facets when the list of is too long

## 1.4.0
- Added more facets to filter search results:
	- Author
	- Temporal Duration (less than 1 year, 1-4 years, 5-9 years, and 10 or more years)
	- Spatial Coverage (global or non-global)
- Display only the first 10 results for each facet with the option to show all
- Fixed a bug where facets were not consistently appearing the first time a search was executed

## 1.3.0
- Changed results layout to handle tabulated values(ADE)
- Updated results items to handle multiple values i.e. multiple time ranges and bounding boxes (ADE)
- Added Data Center facet to browse results using the different data centers as filters.
- Fixed polar map selection when a box crosses the international date line.
- Added landing page for NSIDC
- Fixed IE8 parsing issues
- Updated styles for alert messages

## 1.2.3
- Several minor changes to the spatial selection popup based on usability feedback
- User can now move the map around (panning)
- New look for map controls and icons

## 1.2.2
- Results do not display empty metadata values
- Modified map controls so that the box can be resized rather than scaled
- Zooming the map now centers around the selected region
- Metrics tracking for OpenSearch requests
- Phrase searching now treats terms individually, stripping the quotes from the query

## 1.2.1
- Turned on results count dropdown
- Bug fixes for harvesting all CISL records
- Fixed parsing of temporal ranges so that NODC records display correctly
- Pagination controls now disabled for single page results
- Spatial extent 'reset' now clears the selection and the spatial filter input

## 1.2.0
- Changed underlying service to make OpenSearch requests to query a Solr database rather than GI-Cat
- Modified parsing of OpenSearch XML to get the correct fields
- Source feeds (EOL, NMI, NODC, NSIDC) now being ingested into Solr from GI-Cat CSW/ISO output
- Interface tweaks to make NSIDC Search more consistent with ACADIS ADE
- Bug fixes to support Internet Explorer 8, 9, 10

## 1.1.6
- Fixed bug where X button to remove search terms was not working
- Fixed display of temporal range and data centers in search results

## 1.1.5
- Changed content to the landing page, added NODC as a resource
- Added 'Ask Me' feedback tab

## 1.1.4
- Fixed bug that items per page option was not kept when a new search is performed
- Disabled the items per page options in pagination
- updated the configuration to be application settings and dependency injection settings

## 1.1.3
- Added dropdown to change the number of visible search results per page
- Data updated more recently will appear higher in the search results
- Fixed bug where search results were not displayed in Internet Explorer 8
- Fixed bug where the map was being rendered twice in the spatial selection popup
- When a bounding box is drawn to cross the date line in the spatial selection popup, the area across the date line is highlighted on the map

## 1.1.2
- The 'North Polar' view is now the default for the spatial selection popup
- Fixed spatial selection map to handle selections across the dateline in the global view
- Removed the southern hemisphere view from the spatial selection popup
- Mouse icon now changes to a pointer when hovering over the map for more intuitive controls

## 1.1.1
- Fixed bug affecting improper submission of search terms with international characters, e.g. searching for "Jökulsárlón"
- Fixed bug affecting Firefox 6, where multiple-term searches were dropping the last term
- Fixed bug where map projection changes would cause the interface to hang
- Fixed bug where data centers were defaulting to NSIDC when they were not
- Fixed bug where the reset search link was not resetting the search
- Fixed bug with map selection interactions with the compass controls
- Fixed bug with race conditions not correctly updating the spatial search geometry

## 1.1.0
- Single character search terms are ignored
- Forward slash in a search term no longer splits that search term in two, e.g. for "SSM/I"
- Application now starts with a home page and introduces features to the user
- The 'Reset Search' link now directs the user back to the home page
- An error message is displayed when attempting a geospatial search across the International Date Line

## 1.0.3 (May 22, 2013)
- Changed go to data links for NODC feeds, instead of pointing to a browse image now it points out to the FTP data pool.
- Restyled buttons, input fields, and heading

## 1.0.2 (May 16, 2013)
- Added request handling that cancels all the in-progress search when a new search is issued

## 1.0.1
- Fixed bug where "Show More" was not appearing for results with short summaries
- Added "Reset Search" functionality in current search criteria box
- Refactored code loading scheme to use AMD for all JS and templates
- Changed event model to use a centralized mediator

## 0.1.1

- Minor text change: "Search Terms" -> "Tags"

## 0.1.0

- Immediate feedback when removing search terms for the current search
- Displaying version number in footer of page

## 0.0.1+build.420 (April 9, 2013)

Several interface modifications prompted by user feedback.

- Adjusted order of search fields for more sensible flow. Changed labels and wording (i.e. 'Keywords' to 'Text Search')
- Calendar icons and spatial search icon now inside the input box
- Keywords for each data set now appear in the search results

## 0.0.1+build.400 (April 2, 2013)

Added and improved metadata fields for search results including the last updated date, data centers and keywords.

- Error checking for the temporal range entry fields
- Presentation and behavior tweaks with significant error checking for the spatial bounds entry popup.  Default values shown with one decimal place.
- Data center names are being more thoroughly extracted from the OpenSearch results
- In the case of multiple data centers, entries are all displayed, separated by " / "
- Data set's last modification date is being displayed in search results
- Searches using keywords have been modified to query against the title, summary, and keyword metadata
- 'Get Data' button now directs user to the dataset landing page and opens in a new tab
