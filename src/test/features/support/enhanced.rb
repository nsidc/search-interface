require 'cucumber/formatter/unicode'
require 'json'
require 'yaml'
require 'nsidc/config_injector_client'

# Setup all the config info

class RemoteBrowserCreator
  def initialize

    # the saucelabs username and API key do not differ across environments, so
    # we can always use integration instead of varying based on the environment
    # the tests are running against
    config_client = Nsidc::ConfigInjectorClient.new(
      'http://config-injector-vm.apps.int.nsidc.org:10680',
      'integration'
    )

    @config = {
      :os =>       ENV['SELENIUM_BROWSER_OS'],
      :browser =>  ENV['SELENIUM_BROWSER_NAME'],
      :version =>  ENV['SELENIUM_BROWSER_VERSION'],
      :username => config_client.get('saucelabs.username'),
      :api_key =>  config_client.get('saucelabs.api_key')
    }

    # Double-check to make sure we have all the config we need to run a proper job
    errors = []
    @config.each_pair { |key, value| errors << "#{key} is nil" if value.nil? }

    # Give helpful errors and suggestions if not
    unless errors.empty?
      errors.each { |e| puts e }
      puts "... Are you running this from the rake task? That's the recommended methods - it'll run your tests much, much faster. Check it out with:"
      puts "\trake cucumber_sauce"
      puts "If not, be sure to set the environment variables."
      puts "\tExample: SELENIUM_BROWSER_OS=\"Windows 2003\" SELENIUM_BROWSER_NAME=\"firefox\" SELENIUM_BROWSER_VERSION=\"3\" cucumber"
      exit 1
    end
  end

  def create(scenario)
    if defined? scenario.scenario_outline
      outline = scenario.scenario_outline
      job_name = "#{outline.name.capitalize}: #{scenario.name}"
    else
      job_name = "#{scenario.name} (#{@config[:browser]})"
    end

    browser_caps = Selenium::WebDriver::Remote::Capabilities.method(@config[:browser]).call
    browser_caps.platform = @config[:os]
    browser_caps[:name] = "#{job_name} on #{@config[:os]}"
    browser_caps[:version] = @config[:version] unless @config[:version] == "default"

    browser_type = :remote
    browser_options = {
      :url => "http://#{@config[:username]}:#{@config[:api_key]}@ondemand.saucelabs.com:80/wd/hub",
      :desired_capabilities => browser_caps
    }

    Watir::Browser.new browser_type, browser_options
  end
end

class LocalBrowserCreator
  def create(scenario)
    Watir::Browser.new :firefox
  end
end

if ENV['CLOUD'] == "sauce"
  browser_creator = RemoteBrowserCreator.new
else
  browser_creator = LocalBrowserCreator.new
end

Before do |scenario|
  @browser = browser_creator.create(scenario)
end

After do |scenario|
  @browser.close
end
