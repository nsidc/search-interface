# Load modules and classes
lookup('classes', {merge => unique}).include

if $environment == 'ci' {
  # Ensure the brightbox apt repository gets added before installing ruby
  include apt
  apt::ppa{'ppa:brightbox/ruby-ng':}

  package { 'ruby-switch':
    ensure => present,
  }

  package { 'ruby2.5':
    ensure => present,
    require => [ Class['apt'], Apt::Ppa['ppa:brightbox/ruby-ng'] ]
  } ->
  package { 'ruby2.5-dev':
    ensure => present
  } ->
  exec { 'switch-ruby':
    command => 'ruby-switch --set ruby2.5',
    path => ['/usr/bin'],
    require => Package['ruby-switch']
  } ->
  exec { 'install bundler':
    command => 'sudo gem install bundler -v 1.17.1',
    path => '/usr/bin'
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
  $grunt_path = '/usr/local/lib/node_modules/grunt-cli/bin'

  file { '/usr/local/bin/grunt':
    ensure => 'link',
    target => "$grunt_path/grunt",
    require => Package['grunt-cli']
  }

  # browser/ display stuff for running acceptance tests
  class { 'firefox':
    version => '27.0.1-0ubuntu1'
  }

  package { 'vnc4server':
    require => User['vagrant']
    } ->

  package { 'expect': } ->

  # if this does not work, run vncpasswd on the CI vm, entering whatever
  # password you like
  exec { 'set_vnc_password':
    path => '/usr/bin/',
    command => 'sudo -i -u vagrant tr -dc A-Z < /dev/urandom | head -c 8 | /usr/bin/expect -c "set passwd [read stdin]; spawn sudo -i -u vagrant vncpasswd; expect \"Password:\"; send -- \"\$passwd\r\"; expect \"Verify:\"; send -- \"\$passwd\r\r\";exit;"'
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
}

package { "emacs": }
