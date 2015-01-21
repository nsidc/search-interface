require 'cucumber/rake/task'
require 'fileutils'

BUILD_DIR = 'build'
@log_dir = "#{BUILD_DIR}/log"
@cucumber_test_log_dir = "#{@log_dir}/features"
@product_name = ENV['PRODUCT'] || 'acadis'

desc 'Setting up prerequisites for a build'
task :prepare do
  FileUtils.mkdir_p @cucumber_test_log_dir
end

desc 'Run acceptance tests with a local browser'
Cucumber::Rake::Task.new(:'run_browser_tests' => 'prepare')  do |t|
  ENV['SELENIUM_REPORT_FILENAME'] = ENV['SELENIUM_REPORT_FILENAME'] || "#{@cucumber_test_log_dir}/standalone"
  ENV['JUNIT_REPORT_DIR'] = ENV['JUNIT_REPORT_DIR'] || @cucumber_test_log_dir
  t.cucumber_opts = "--tags @#{@product_name}"
end
