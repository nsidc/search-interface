class AdeSearchResultsPage
  attr_reader :total_num_results, :results_on_page,
              :current_page_number, :titles, :num_dataset_titles

  def initialize(browser)
    @total_num_results = Integer(browser.span(class: 'total-results-count').text.split.first)
    @results_on_page = browser.elements(class: 'result-item').size
    @current_page_number = browser.a(class: 'current-page').text.split.first || '1'

    @results = browser.elements(class: 'result-item').map do |result_item|
      SearchResultItem.new(result_item)
    end

    @num_dataset_titles = browser.elements(class: 'dataset-title').size
  end

  def first_title
    @results.first.title
  end

  def first_start_date
    @results.first.start_date
  end

  def first_end_date
    @results.first.end_date
  end

  def first_data_center_name
    @results.first.data_center_name
  end

  def first_date_modified
    @results.first.date_modified
  end
end
