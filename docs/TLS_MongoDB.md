### Configuring and Using TLS with MongoDB

Copyright (c) 2016 by Ashley Willis.

#### Configuring

This assumes you already have a TLS certificate.

* Add the following to `/etc/mongod.conf`, making sure the cert is owned by and
  only readable by the `mongod` process:

        tlsMode=requireTLS
        tlsPEMKeyFile=/etc/ssl/certs/mongodb-cert.pem	# set the correct path

* Restart `mongod`.

#### Connecting with the MongoDB shell

To connect using the `mongo` shell, you must include the `--tls` option.

In addition, you must pass the Certificate Authority file for TLS with
`--tlsCAFile` and use the fully qualified domain name:

    mongo --tls --tlsCAFile $PATH --host $FQDN $DATABASE

or:

    mongo --tls --tlsCAFile $PATH $FQDN/$DATABASE

To connect to `localhost` where the domain in your cert will not match, you can
instead pass `--tlsAllowInvalidCertificates` and omit the host.

    mongo --tls --tlsAllowInvalidCertificates $DATABASE

#### Connecting with the MongoDB perl driver

In perl, you connect with the following:

    my $mongo = MongoDB->connect($fqdn, {ssl => {SSL_ca_file => $path}});

Or if connecting to `localhost`, with:

    my $mongo = MongoDB->connect("localhost", {ssl => {SSL_verify_mode => 0x00}});
