# Rakefile for arctic-data-explorer
#
# 2012-02-17
# National Snow & Ice Data Center, University of Colorado, Boulder
# Copyright (C) 2012 University of Colorado.

require "rubygems"
require "bundler/setup"
require "ci/reporter/rake/rspec"
require "rspec/core/rake_task"
require 'cucumber/rake/task'
require "rake/clean"
require "fileutils"
require 'parallel'
require 'yaml'
require 'json'

BUILD_DIR = "build"

DEPLOYMENT_ENVIRONMENTS = {
  :acadis => {
     :integration => "/disks/devsnowdev/live/apps/arctic-data-explorer",
     :qa => "/disks/testsnowtest/live/apps/arctic-data-explorer",
     :staging => "/disks/staging/live/apps/arctic-data-explorer",
     :production => "/disks/production/live/apps/arctic-data-explorer",
  },
  :nsidc => {
     :integration => "/disks/devsnowdev/live/apps/nsidc_search/webapps",
     :qa => "/disks/testsnowtest/live/apps/nsidc_search/webapps",
     :staging => "/disks/staging/live/apps/nsidc_search/webapps",
     :production => "/disks/production/live/apps/nsidc_search/webapps",
  }
}

DEPLOYMENT_LOGS = {
  :acadis => {
    :integration => "/disks/integration/san/INTRANET/REPO/acadis_search/deployable_versions_qa",
    :qa => "/disks/integration/san/INTRANET/REPO/acadis_search/deployable_versions_staging",
    :staging => "/disks/integration/san/INTRANET/REPO/acadis_search/deployable_versions_production",
    :production => "/disks/integration/san/INTRANET/REPO/acadis_search/deployed_versions_production",
    :vm => "/disks/integration/san/INTRANET/REPO/acadis_search/deployed_versions_vm"
  },
  :nsidc => {
    :integration => "/disks/integration/san/INTRANET/REPO/nsidc_search/deployable_versions_qa",
    :qa => "/disks/integration/san/INTRANET/REPO/nsidc_search/deployable_versions_staging",
    :staging => "/disks/integration/san/INTRANET/REPO/nsidc_search/deployable_versions_production",
    :production => "/disks/integration/san/INTRANET/REPO/nsidc_search/deployed_versions_production",
    :vm => "/disks/integration/san/INTRANET/REPO/nsidc_search/deployed_versions_vm"
  }
}

ENV['CI_REPORTS'] = ENV['CI_REPORTS'] || 'build/log/spec'

@log_dir = "#{BUILD_DIR}/log"
@spec_test_log_dir = "#{@log_dir}/spec"
@cucumber_test_log_dir = "#{@log_dir}/features"
@product_name = ENV['PRODUCT'] || "acadis"
@environment = ENV['ENVIRONMENT'] || "production"

CLOBBER.include(BUILD_DIR)
CLEAN.include(@log_dir)

desc "Setting up prerequisites for a build"
task :prepare do
  @version_id = generate_version_id

  FileUtils.mkdir_p tarball_staging_dir, :mode => 0775
  FileUtils.mkdir_p @spec_test_log_dir
  FileUtils.mkdir_p @cucumber_test_log_dir
end

desc "prints the artifact identifier being generated"
task :display_version_id => [:prepare] do
  puts @version_id
end

desc "prints the name of the directory to which artifacts are distributed"
task :display_staging_directory do
  puts staging_directory
end

desc "prints the supported deployment target environments"
task :display_deployment_targets do
  DEPLOYMENT_ENVIRONMENTS.each do |k,v|
    padded_key = "%15s" % k
    if(v.is_a?(Hash))
      puts "#{padded_key}:"
      v.each do |k,v|
        padded_key = "%25s" % k
        puts "#{padded_key} -> #{v}"
      end
    end
  end
end

desc "Create a tarball of the necessary files for the acadis search project"
task :package => [:prepare] do
  copy_files_to_tarball_staging_dir
  create_tarball :output_filename => build_artifact_filename
end

desc "Copies the package tarball out to a staging area in preparation for deployment"
task :distribute => [:package] do
  FileUtils.cp build_artifact_filename, staging_directory
  FileUtils.chmod 0664, "#{staging_directory}/#{artifact_id}.tgz"
end

desc "deploy specific artifact to target environment"
task :deploy, :version_id, :environment do |t, args|
  deploy_to_target_environment args
end

desc "undeploy specific artifact to target environment"
task :undeploy, :version_id, :environment do |t, args|
  undeploy_to_target_environment args
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

desc "Add build version to successfully deployed artifacts log"
task :add_build_version_to_log, :version_id, :environment do |t, args|
  version_id = "#{args[:version_id]}"
  deployment_env = args[:environment].to_sym
  product_target = @product_name.to_sym

  deployment_log = DEPLOYMENT_LOGS[product_target][deployment_env]

  if(!File.exists?(deployment_log))
    File.open(deployment_log, 'w') do |f|
      f.write('buildVersion=')
      f.write('latestVersion=')
    end
  end
  if(File.open(deployment_log, 'r') { |f| !f.read.include?(version_id) })
    `sed -i "s/buildVersion=/buildVersion=#{version_id},/" #{deployment_log}`
    `sed -i "s/latestVersion=.*/latestVersion=#{version_id}/" #{deployment_log}`
  end
end

task :npm_prune do
  sh 'npm prune'
end

task :npm_install => :npm_prune do
  # Install node modules
  sh 'npm install'
end

desc "generate product specific html and css files with grunt"
task :grunt_generate => :npm_install do |t, args|
  sh "grunt build:#{@product_name} --environment=#{@environment}"
end

desc "Run JSHint against all JS source and test code"
task :jshint => :npm_install do
  sh "grunt jshint"
end

desc "Run Jasmine tests in PhantomJS"
task :jasmine => :npm_install do
  sh "grunt jasmine"
end

def deploy_to_target_environment args
  @version_id = "#{args[:version_id]}"

  deployment_target = args[:environment].to_sym

  product_target = @product_name.to_sym

  puts "#{product_target} - #{deployment_target}"


  if(valid_targets?(deployment_target, product_target))
    deployment_directory = DEPLOYMENT_ENVIRONMENTS[product_target][deployment_target]
    verify_create_dir deployment_directory
    FileUtils.rm_r Dir.glob("#{deployment_directory}/*"), :force => true
    sh "tar -xvf #{staged_artifact_filename} --directory=#{deployment_directory} --strip-components=1"
  else
    fail "Unsupported deployment environment (#{deployment_target})"
  end
end

def verify_create_dir path
  FileUtils.mkdir_p(path) unless File.exists?(path)
end

def undeploy_to_target_environment args
  @version_id = "#{args[:version_id]}"

  undeployment_target = args[:environment].to_sym

  product_target = @product_name.to_sym

  if(valid_targets?(undeployment_target, product_target))
    undeployment_directory = DEPLOYMENT_ENVIRONMENTS[product_target][undeployment_target]
    FileUtils.rm_r Dir.glob("#{undeployment_directory}/*"), :force => true
  elsif
    fail "Unsupported undeployment environment (#{undeployment_target})"
  end
end

def valid_targets? env_target, product_target
  if(DEPLOYMENT_ENVIRONMENTS.has_key?(product_target) && DEPLOYMENT_ENVIRONMENTS[product_target].has_key?(env_target))
    return true
  end

  return false
end

def artifact_id
  "#{@product_name}_search_#{@version_id}"
end

def tarball_staging_dir
  "#{BUILD_DIR}/#{artifact_id}"
end

def staging_directory
  "/disks/www/DEV/INTRANET/REPO/#{@product_name}_search"
end

def copy_files_to_tarball_staging_dir
  FileUtils.cp_r "tmp/.", tarball_staging_dir, :verbose => true
end

def build_artifact_filename
  "#{BUILD_DIR}/#{artifact_id}.tgz"
end

def staged_artifact_filename
  "#{staging_directory}/#{artifact_id}.tgz"
end

def create_tarball options
  source_subdir = artifact_id
  sh "tar -cvzf #{options[:output_filename]} --exclude=.svn --directory=#{BUILD_DIR} #{source_subdir}"
end

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
