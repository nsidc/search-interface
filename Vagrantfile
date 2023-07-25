# -*- mode: ruby -*-
# vi: set ft=ruby :
require 'vagrant-nsidc/plugin'

Vagrant.configure(2) do |config|
  config.ssh.forward_x11 = true
  config.vm.network "forwarded_port", guest: 80, host: 9080
  config.vm.network "forwarded_port", guest: 443, host: 9443
  config.vm.synced_folder ".", "/vagrant", type: "rsync", rsync__exclude: [".git/", "puppet/modules/*", "puppet/.tmp/*", "node_modules/*", "dist/*"]

  config.vm.provision :shell do |s|
    s.name = 'apt-get update'
    s.inline = 'apt-get update'
  end
  config.vm.provision :shell do |s|
    s.name = 'librarian-puppet install'
    s.inline = 'cd /vagrant/puppet && librarian-puppet install --path=./modules'
  end
  config.vm.provision :puppet do |puppet|
    puppet.working_directory = '/vagrant'
    puppet.manifests_path = './puppet'
    puppet.manifest_file = 'site.pp'
    puppet.options = '--detailed-exitcodes --modulepath ./puppet/modules'
    puppet.environment = VagrantPlugins::NSIDC::Plugin.environment
    puppet.environment_path = './puppet/environments'
    puppet.hiera_config_path = './puppet/hiera.yaml'
  end
end
