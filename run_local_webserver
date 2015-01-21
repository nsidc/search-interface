#!/usr/bin/env ruby

require 'webrick'
require 'open-uri'
require 'yaml'

class SsiHandler < WEBrick::HTTPServlet::FileHandler
  def initialize(server, root, options={})
    super
    @host = options[:Host]
    @enabled = options[:Enabled]
  end

  def service(req, res)
    super
    if @enabled && res.body.path.include?('.html')
      body = res.body.read

      body.scan(/\<!--#include virtual=".*" --\>/).each do |match|
        sub_start = match.index('"') + 1
        sub_end = match.index('"', sub_start)
        ssi_file = match[sub_start, sub_end - sub_start]
        ssi_content = open("#{@host}#{ssi_file}").read
        body.insert(body.index(match) + match.length, ssi_content.gsub(/href="\//, "href=\"#{@host}/").gsub(/src="\//, "src=\"#{@host}/"))
      end

      res.body = body
      res.content_length = body.length
    end
  end
end

def start_webrick(config = {})
  local_config = YAML.load_file('config/local_webserver_config.yaml')

  if config[:Port].nil?
    config.update(:Port => local_config['webserver']['local']['port'])
  end
  server = WEBrick::HTTPServer.new(config)

  local_config['webserver']['local']['mount_dirs'].each do |d|
    puts "Mounting #{d["file_path"]} at #{d["server_path"]}"
    server.mount d["server_path"], SsiHandler, d["file_path"], { :FancyIndexing => true, :Host => local_config['webserver']['ssi']['host'], :Enabled => local_config['webserver']['ssi']['enabled']}
  end

  proxed_paths = {}
  proxies = config[:Proxies] || 'search_proxies'
  local_config['webserver']['local'][proxies].each do |search_proxy|
    if (search_proxy['enabled'])
      proxed_paths["http://#{search_proxy['remote_host']}:#{search_proxy['port']}#{search_proxy['path']}"] = search_proxy['server_path']
      server.unmount search_proxy['server_path']
      server.mount_proc search_proxy['server_path'] do |req, res|
          search_url = "http://#{search_proxy['remote_host']}:#{search_proxy['port']}#{search_proxy['path']}?#{req.query_string}"
          res.status = 200
          res['Content-Type'] = search_proxy['content_type']
          res['Access-Control-Allow-Origin'] = '*'  # may as well throw in a CORS header...

          # It's hokey, but it seems to work: after pulling the content down from the remote server, replace any paths that are proxied by this server.
          body = open(search_url).read
          proxed_paths.each do |remote_path, local_path|
            body = body.gsub(remote_path, "http://#{req.host}:#{req.port}#{local_path}")
          end

          res.body = body
      end
    end
  end

  yield server if block_given?

  ['INT', 'TERM'].each do |signal|
    trap(signal) {server.shutdown}
  end

  server.start
end

start_webrick({:DocumentRoot => Dir::pwd, :Port => ARGV[0], :Proxies => ARGV[1]})
