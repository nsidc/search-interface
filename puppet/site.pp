# Load modules and classes
hiera_include('classes')

if $environment == 'ci' {
  # Ensure the brightbox apt repository gets added before installing ruby
  include apt
  apt::ppa{'ppa:brightbox/ruby-ng':}
  class {'ruby':
    require         => [ Class['apt'], Apt::Ppa['ppa:brightbox/ruby-ng'] ]
  }
  class {'ruby::dev':
    require         => [ Class['apt'], Apt::Ppa['ppa:brightbox/ruby-ng'] ]
  }

  # Nokogiri dependencies
  package {"libxml2-dev":
    ensure => present
  }
  package {"libxslt-dev":
    ensure => present
  }

  # install npm, grunt
  include nodejs

  package { 'grunt-cli':
    ensure => present,
    provider => 'npm',
    require => Class['nodejs'],
  }

  # willdurand-nodejs installs the executables into
  # /usr/local/node/node-default/bin/, we want access to them on the
  # PATH, so create symlinks in /usr/local/bin

  $node_path = '/usr/local/node/node-default/bin'

  file { '/usr/local/bin/node':
    ensure => 'link',
    target => "$node_path/node",
    require => Class['nodejs']
  }

  file { '/usr/local/bin/npm':
    ensure => 'link',
    target => "$node_path/npm",
    require => Class['nodejs']
  }

  file { '/usr/local/bin/grunt':
    ensure => 'link',
    target => "$node_path/grunt",
    require => Package['grunt-cli']
  }
}

if $environment == 'integration' {

  $application_root='/usr/share/nginx/portal/'

  class { 'nginx' :
    gzip => 'off'
  }

  nginx::resource::vhost { 'localhost' :
    www_root => '/usr/share/nginx/html',
    ensure  =>  absent
  }

  nginx::resource::vhost { 'search' :
    www_root => $application_root
  }

  nginx::resource::location { '/acadis/search' :
    location_alias => $application_root,
    vhost => 'search'
  }

  nginx::resource::location { '/data/search' :
    location_alias => $application_root,
    vhost => 'search'
  }

  file { "/etc/nginx/conf.d/default.conf" :
    ensure  => absent
  }

}

package { "emacs": }
