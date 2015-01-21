require 'cucumber/rake/task'
require 'fileutils'

Cucumber::Rake::Task.new(:'run_browser_tests')  do |t|
  cucumber_test_log_dir = File.join('tmp', 'log', 'feature')

  FileUtils.mkdir_p(cucumber_test_log_dir)

  ENV['JUNIT_REPORT_DIR']         ||= cucumber_test_log_dir
  ENV['SELENIUM_REPORT_FILENAME'] ||= File.join(cucumber_test_log_dir, 'standalone')

  product_name = ENV['PRODUCT'] || 'acadis'
  t.cucumber_opts = "--tags @#{product_name}"
end
