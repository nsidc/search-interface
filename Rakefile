require "ci/reporter/rake/rspec"
require "rspec/core/rake_task"
require 'cucumber/rake/task'
require "fileutils"
require 'parallel'
require 'yaml'
require 'json'

BUILD_DIR = "build"
ENV['CI_REPORTS'] = ENV['CI_REPORTS'] || 'build/log/spec'
@log_dir = "#{BUILD_DIR}/log"
@cucumber_test_log_dir = "#{@log_dir}/features"
@product_name = ENV['PRODUCT'] || "acadis"

desc "Setting up prerequisites for a build"
task :prepare do
  @version_id = generate_version_id

  FileUtils.mkdir_p tarball_staging_dir, :mode => 0775
  FileUtils.mkdir_p @cucumber_test_log_dir
end

desc "Run all features against all browsers in parallel; specify an optional BROWSERS=<browsers_full.yml> to specify browser/OS combinations"
task :cucumber_sauce => :prepare do
  year, month, day = Date.today.strftime("%Y,%m,%d").split(",")
  dir = "#{@log_dir}/reports/#{year}/#{month}"
  FileUtils::mkdir_p(dir)

  # Edit the browser yaml file to specify which os/browsers you want to use
  # You can use multiple files and specify which to use at runtime
  browser_file = ENV['BROWSERS'] || "config/browsers_full.yml"
  @browsers = YAML.load_file(browser_file)[:browsers]

  if ENV['NUM_CUKE_THREADS'].nil?
    num_threads = 0
  else
    num_threads = ENV['NUM_CUKE_THREADS'].to_i
  end

  Parallel.map(@browsers, :in_threads => num_threads) do |browser|
    begin
      puts "Running with: #{browser.inspect}"
      ENV['CLOUD'] = "sauce"
      ENV['SELENIUM_BROWSER_OS'] = browser[:os]
      ENV['SELENIUM_BROWSER_NAME'] = browser[:name]
      ENV['SELENIUM_BROWSER_VERSION'] = browser[:version]
      ENV['SELENIUM_REPORT_FILENAME'] = "#{@cucumber_test_log_dir}/#{year}-#{month}-#{day}-#{browser[:os]}_#{browser[:name]}_#{browser[:version]}".gsub(/\s/, "_").gsub("..", ".")
      ENV['JUNIT_REPORT_DIR'] = "#{@cucumber_test_log_dir}/#{year}-#{month}-#{day}-#{browser[:os]}_#{browser[:name]}_#{browser[:version]}".gsub(/\s/, "_").gsub("..", ".")

      year, month, day = Date.today.strftime("%Y,%m,%d").split(",")
      dir = "#{@log_dir}/reports/#{year}/#{month}"

      Rake::Task[ :run_browser_tests ].execute()
    rescue RuntimeError
      puts "Error while running task"
    end
  end
end

desc "Run acceptance tests with a local browser"
Cucumber::Rake::Task.new(:'run_browser_tests' => 'prepare')  do |t|
  ENV['SELENIUM_REPORT_FILENAME'] = ENV['SELENIUM_REPORT_FILENAME'] || "#{@cucumber_test_log_dir}/standalone"
  ENV['JUNIT_REPORT_DIR'] = ENV['JUNIT_REPORT_DIR'] || @cucumber_test_log_dir
  t.cucumber_opts = "--tags @#{@product_name}"
end

# in task :prepare
def tarball_staging_dir
  "#{BUILD_DIR}/#{artifact_id}"
end

# in method tarball_staging_dir
def artifact_id
  "#{@product_name}_search_#{@version_id}"
end

# in task :prepare
def generate_version_id
  version_string = JSON.parse( File.open("package.json") { |f| f.read } )["version"]

  # TODO [IT, 20120217] There's a Semver class hiding in this method... Extract it out.
  if ENV.has_key? "JENKINS_HOME"
    pre_release_version_string = ""
  else
    pre_release_version_string = "-dev"
  end

  if ENV.has_key? "BUILD_NUMBER"
    build_version_string = "+build.#{ENV['BUILD_NUMBER']}"
  else
    build_version_string = ""
  end

  version_string + pre_release_version_string + build_version_string
end
