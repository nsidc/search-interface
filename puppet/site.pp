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

  # browser/ display stuff for running acceptance tests
  class { 'firefox':
    version => '27.0.1-0ubuntu1'
  }
  
  package { 'vnc4server': } ->
  
  package { 'expect': } ->
  
  
  exec { 'set_vnc_password':
    path => '/usr/bin/',
    command => 'sudo -i -u jenkins tr -dc A-Z < /dev/urandom | head -c 8 | /usr/bin/expect -c "set passwd [read stdin]; spawn sudo -i -u jenkins vncpasswd; expect \"Password:\"; send -- \"\$passwd\r\"; expect \"Verify:\"; send -- \"\$passwd\r\r\";exit;"'
}

  package { 'fluxbox': }
}

# blue/green/red can be removed from here when VGTNSIDC-153 is done
if ($environment == 'integration') or ($environment == 'qa') or ($environment == 'staging') or ($environment == 'production') or ($environment == 'blue') or ($environment == 'green') or ($environment == 'red') {

  $hiera_project = hiera('project')

  $application_root = "/opt/${hiera_project}"

  class { 'nginx' :
    gzip => 'off'
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

  # remove default nginx config
  nginx::resource::vhost { 'localhost' :
    www_root => '/usr/share/nginx/html',
    ensure  =>  absent
  }

  file { "/etc/nginx/conf.d/default.conf" :
    ensure  => absent
  }

}

package { "emacs": }
