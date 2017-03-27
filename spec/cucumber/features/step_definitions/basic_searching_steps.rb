Before do
  @url = ENV['URL'] || 'http://integration.nsidc.org/acadis/search'
end

Given(/^I open the search page not expecting a home page$/) do
  @search_page = AdeSearchPage.new(@url, @browser)
  @search_page.wait_until_loading_is_complete
  @search_page.add_results_to_history
end

Given(/^I open the search page expecting a home page$/) do
  @search_page = AdeSearchPage.new(@url, @browser)
  @search_page.wait_until_home_page_is_visible
end

Then(/^there should be some search results$/) do
  @search_page.results_count.should >= 1
end

Then(/^all search results should have a title$/) do
  @search_page.num_dataset_titles.should == @search_page.results_count
end

When(/^I search for "(.*?)"$/) do |search_term|
  @search_page.search_for(search_term)
end

When(/^I wait for the results to come back$/) do
  @search_page.wait_for_results
end

Then(/^we should be back in the homepage$/) do
  @search_page.home_page_text.include? 'The Arctic Data Explorer'
end

Then(/^the total number of results should have gone down$/) do
  @search_page.total_results_count.should < @search_page.previous_total_results_count
end

Then(/^the top search result title should be "(.*?)"$/) do |word|
  @search_page.first_result_title.eql? word
end

Then(/^the top search result title should contain "(.*?)"$/) do |word|
  @search_page.first_result_title.include? word
end

When(/^I click the next page button$/) do
  @search_page.click_next_page_button
end

Then(/^the page number should be "(.*?)"$/) do |page_number|
  @search_page.current_page_number.should == page_number
end

Then(/^I should see text containing "(.*?)"$/) do |home_text|
  @search_page.home_page_text.include? home_text
end

When(/I follow each link to a search faceted by data center/) do
  @search_page.update_expected_data_center_counts
  @search_page.search_expected_data_center_counts
end

Then(/I should get the correct number of results for each data center/) do
  @search_page.actual_data_center_counts.should == @search_page.expected_data_center_counts
end
