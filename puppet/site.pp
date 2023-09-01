# Load modules and classes
lookup('classes', {merge => unique}).include

if $environment != 'ci' {
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
