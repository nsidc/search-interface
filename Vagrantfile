# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.network "forwarded_port", guest: 80, host: 9080
  config.vm.network "forwarded_port", guest: 443, host: 9443
  config.vm.synced_folder ".", "/vagrant", type: "rsync", rsync__exclude: ["puppet/modules/*", "puppet/.tmp/*"]
  config.vm.allowed_synced_folder_types = [:rsync]
end
