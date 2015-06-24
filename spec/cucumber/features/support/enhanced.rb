Before do |_scenario|
  @browser = Watir::Browser.new :firefox
end

After do |_scenario|
  @browser.close
end
