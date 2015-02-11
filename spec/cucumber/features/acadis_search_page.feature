@ade_search
Feature: Search Page Basics

  Scenario: Starting the application
    Given I open the search page expecting a home page
    Then I should see text containing "Arctic Data Explorer"

  Scenario: Default search
    Given I open the search page expecting a home page
    When I search for ""
    And I wait for the results to come back
    Then there should be some search results
    And all search results should have a title

  Scenario: Basic searching
    Given I open the search page expecting a home page
    When I search for ""
    And I wait for the results to come back
    And I search for "ice"
    And I wait for the results to come back
    Then there should be some search results
    And the total number of results should have gone down

  Scenario: Relevance-ranked searches
    Given I open the search page expecting a home page
    When I search for "stratigraphy"
    And I wait for the results to come back
    Then the top search result title should contain "Stratigraphy"

  Scenario: Multiple pages
    Given I open the search page expecting a home page
    And I search for "ice"
    And I wait for the results to come back
    When I click the next page button
    Then the page number should be "2"

  Scenario: Live Counts by Data Center on the Home Page
    Given I open the search page expecting a home page
    When I follow each link to a search faceted by data center
    Then I should get the correct number of results for each data center
