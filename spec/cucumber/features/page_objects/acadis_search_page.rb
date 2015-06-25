require 'watir-webdriver'

class AcadisSearchPage
  attr_reader :expected_data_center_counts, :actual_data_center_counts

  def initialize(url, browser = nil)
    @timeout = 120
    @url = url
    @browser = browser || Watir::Browser.new
    @browser.goto @url
    @results_history = []

    # key: data center short name
    # value: expected number of datasets
    @expected_data_center_counts = {}
    @actual_data_center_counts = {}
  end

  def wait_until_home_page_is_visible
    @browser.div(id: 'home-page').wait_until_present(@timeout)
  end

  def wait_until_loading_is_complete
    sleep 0.25
    @browser.div(id: 'current-results').wait_until_present(@timeout)
  end

  def add_results_to_history
    @results_history.push(AcadisSearchResultsPage.new(@browser))
  end

  def search_for(term)
    @browser.text_field(:id, 'keyword').set term
    @browser.button(:id, 'search-now').click
  end

  def wait_for_results
    wait_until_loading_is_complete
    add_results_to_history
  end

  def results_count
    last_results_page.results_on_page
  end

  def total_results_count
    last_results_page.total_num_results
  end

  def previous_results_count
    @results_history[@results_history.count - 2].results_on_page
  end

  def previous_total_results_count
    @results_history[@results_history.count - 2].total_num_results
  end

  def first_result_title
    last_results_page.first_title
  end

  def num_dataset_titles
    last_results_page.num_dataset_titles
  end

  def first_result_start_date
    last_results_page.first_start_date
  end

  def first_result_end_date
    last_results_page.first_end_date
  end

  def first_data_center_name
    last_results_page.first_data_center_name
  end

  def first_result_date_modified
    last_results_page.first_date_modified
  end

  def click_next_page_button
    @browser.a(:class, 'next').click
    wait_until_loading_is_complete
    @results_history.push AcadisSearchResultsPage.new(@browser)
  end

  def current_page_number
    last_results_page.current_page_number
  end

  def last_results_page
    @results_history.last
  end

  def home_page_text
    @browser.div(id: 'home-page').text
  end

  def expected_data_center_counts
    @browser.elements(css: 'ul.live-data-centers li').each do |center|
      # ignore this data center if it's down
      next if center.span(class: 'count').text == '- temporarily unavailable'

      # store the expected result by data center short name and the dataset
      # count given on the home page
      short_name = center.span(class: 'shortName').text
      expected_results = center.element(css: '.count a').text.sub(' datasets', '').to_i
      @expected_data_center_counts[short_name] = expected_results
    end
  end

  def search_expected_data_center_counts
    @expected_data_center_counts.each do |center, _count|
      li_id = "count-#{center.gsub(%r{[\s\./]}, '')}"
      @browser.element(css: '#' + li_id + ' .count a').click
      sleep 3
      wait_for_results
      @actual_data_center_counts[center] = total_results_count

      # extra pause time here; for some reason, results are rendered along with
      # the home page without the sleep command; cannot reproduce this
      # controlling the page manually
      sleep 2
      reset_search
    end
  end

  def reset_search
    @browser.button(class: 'reset-search').click
    sleep 0.25
    wait_until_home_page_is_visible
  end
end
