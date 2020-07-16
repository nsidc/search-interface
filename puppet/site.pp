# Load modules and classes
lookup('classes', {merge => unique}).include

if $environment == 'ci' {
  # Ensure the brightbox apt repository gets added before installing ruby
  include apt
  apt::ppa{'ppa:brightbox/ruby-ng':}

  package { 'ruby-switch':
    ensure => present,
  }

  package { 'ruby2.6':
    ensure => present,
    require => [ Class['apt'], Apt::Ppa['ppa:brightbox/ruby-ng'] ]
  } ->
  package { 'ruby2.6-dev':
    ensure => present
  } ->
  exec { 'switch-ruby':
    command => 'ruby-switch --set ruby2.6',
    path => ['/usr/bin'],
    require => Package['ruby-switch']
  } ->
  exec { 'gem-update':
    command => 'gem update --system',
    path => ['/usr/bin']
  } ->
  exec { 'install bundler':
    command => 'gem install bundler',
    path => '/usr/bin'
  }

  class { 'nodejs':
    version => latest,
   }

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
  package { 'firefox':
    ensure => present
  }

  exec { 'get_geckodriver':
    cwd => '/tmp',
    command => '/usr/bin/wget "https://github.com/mozilla/geckodriver/releases/download/v0.26.0/geckodriver-v0.26.0-linux64.tar.gz"'
  } ->
  exec { 'extract_geckodriver':
    cwd => '/tmp',
    command => '/bin/tar -zxvf geckodriver-v0.26.0-linux64.tar.gz'
  } ->
  exec { 'move_geckodriver':
    cwd => '/tmp',
    command => '/bin/mv geckodriver /usr/local/bin/'
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

if ($environment == 'integration') or ($environment == 'qa') or ($environment == 'staging') or ($environment == 'production') {

  $hiera_project = hiera('project')
  $application_root = "/opt/${hiera_project}"

  class { 'nginx' :
    gzip => 'off'
  }

  exec { 'make_cert':
    path => ['/bin', '/usr/bin'],
    command => 'mkdir -p /etc/nginx/ssl && openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt -subj "/CN=nsidc"'
  } ->
  nginx::resource::vhost { 'search' :
    www_root => $application_root,
    ssl => true,
    ssl_cert => '/etc/nginx/ssl/nginx.crt',
    ssl_key => '/etc/nginx/ssl/nginx.key',
  }

  nginx::resource::location { '/data/search' :
    location_alias => $application_root,
    vhost => 'search',
    ssl => true
  }

  # remove default nginx config
  nginx::resource::vhost { 'localhost' :
    www_root => '/usr/share/nginx/html',
    ensure  =>  absent
  }
}
