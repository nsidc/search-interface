class SearchResultItem
  def initialize(result_element)
    @result_element = result_element
  end

  def title
    @result_element.element(:class => 'dataset-title').text
  end

  def start_date
    start_time_element = @result_element.time(:class, 'dtstart')
    if !start_time_element.present?
      not_specified_element = @result_element.span(:class, 'not-specified')
      return not_specified_element.text
    else
      return start_time_element.text
    end
  end

  def end_date
    end_time_element = @result_element.time(:class, 'dtend')
    if !end_time_element.present?
      not_specified_element = @result_element.span(:class, 'not-specified')
      return not_specified_element.text
    else
      return end_time_element.text
    end
  end

  def data_center_name
    data_center_element = @result_element.p(:class, 'datacenter')
    data_center_name = data_center_element.span(:class, 'datacenter-name') unless data_center_element.nil?
    return data_center_name.text unless data_center_name.nil?
  end

  def date_modified
    date_modified_element = @result_element.span(:class, 'updated-text')
    return date_modified_element.text unless date_modified_element.nil?
  end
end
