@nsidc_search
Feature: Search Page Basics

  Background:
    Given I open the search page expecting a home page

  Scenario: Default search
    When I search for ""
    And I wait for the results to come back
    Then there should be some search results
    And all search results should have a title

  Scenario: Basic searching
    When I search for "ice"
    And I wait for the results to come back
    Then there should be some search results

  Scenario: Relevance-ranked searches
    When I search for "iceberg"
    And I wait for the results to come back
    Then the top search result title should contain "Iceberg"

  Scenario: Multiple pages
    When I search for ""
    And I wait for the results to come back
    And I click the next page button
    Then the page number should be "2"
