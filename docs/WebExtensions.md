### WebExtensions

Copyright (c) 2019 by Ashley Willis.

You can now add custom routes to the web interface using [Limper](https://metacpan.org/pod/Limper),
both as JSON API routes and as web interface routes using [Template::Toolkit](https://metacpan.org/pod/Template::Toolkit).
Template::Toolkit is deprecated as of Disbatch 4.4, and support is likely to be removed in 4.6.

#### Update the config file

* In `web_extensions`, add the package name (ex: `My::Disbatch::Web::Ext`) as a
  field and any options as a value. The value can be any legal JSON value.


#### Routes can have additional MongoDB privileges than the default

* Copy `/etc/disbatch/additional-permissions.json-example` to
  `/etc/disbatch/additional-permissions.json` and edit as needed.

* Rerun `disbatch-create-users` (modify command as needed):

        disbatch-create-users --config /etc/disbatch/config.json --additional_perms /etc/disbatch/additional-permissions.json --root_user root --drop_roles

#### Package

Your package can optionally have `init($disbatch, $options)` called by
`Disbatch::Web`. This allows your package to be passed any needed options (for
example, a config file for your Disbatch plugin), as well as interfacing with
Disbatch (by being passed the `Disbatch::Web` object).

    package My::Disbatch::Web::Ext;

    use 5.12.0;
    use warnings;

    use Disbatch::Web;      # exports: parse_params send_json_options query
    use Limper::SendJSON;
    use Limper;

    my $disbatch;

    sub init {
        ($disbatch, my $args) = @_;
        # do whatever you may need to do with $args
    }

For a simple example not using `init()`, see `Disbatch::Web::Files` (which is automatically loaded at the end of `init()` in `Disbatch::Web`, after any custom routes).
If using `init()`, see `Disbatch::Plugin::Demo::TTExtension`.

If using `Template', replace `use Disbatch::Web` with `use Disbatch::Web::TT` in your extenstion. This will also export `template` and `want_json`.
Make sure to install TT via `cpanm Template`, `dnf install perl-Template`, or however you manage packages.
you also need `cpanm Template::Plugin::SimpleJson`, `dnf install perl-Template-Plugin-SimpleJson`, or similar.
There is automatic loading of `Disbatch::Web::TT` in `etc/disbatch/app.psgi` and `./dev/disbatch-web` if `Template` is installed.
To see how `template` is used, see `Disbatch::Plugin::Demo::TTExtension`. Templates all get inserted as the `[% content %]` part of `views/layouts/main.tt`.
The views directory defaults to `/etc/disbatch/views/`, but can be set via `config.views_dir`.
