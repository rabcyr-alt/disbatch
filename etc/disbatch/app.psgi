use Limper::Engine::PSGI;
use Try::Tiny;

my $module = (eval { require Template; 1 }) ? 'Disbatch::Web::TT' : 'Disbatch::Web';
(my $path = $module) =~ s{::}{/}g;
require "$path.pm";

no strict 'refs';
try { ${"${module}::"}{init}->(config_file => '/etc/disbatch/config.json') } catch { warn "Sleeping 30 seconds due to error loading /etc/disbatch/config.json\n"; sleep 30; die $_ };
${"${module}::"}{limp}->({workers => 10});
