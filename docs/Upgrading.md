### Upgrading from Disbatch 4.2 to Disbatch 4.4

Copyright (c) 2016, 2019, 2026 by Ashley Willis.

This release is made to use newer Perl (v5.32.1, though v5.16.2 and maybe
5.12.0 should work), the latest (and last) Perl MongoDB driver (v2.2.2), and
was tested against MongoDB v6.0.26 (though v3.6.8 should still work, and
possibly 8.2).

The only requirement to upgrade should be the Perl driver, if not already
using v2.2.2.

No changes were made to how data is stored, nor to config files. No new
features were added, but features deprecated in 4.2 and 4.0 were removed.

### Upgrading from Disbatch 4.2 to Disbatch 4.4

This release enables running on newer systems (Perl 5.32, MongoDB 8.2) while hopefully not breaking
running on older systems, and has an entirely new web UI. Code deprecated in 4.0 and 4.2 has been
removed.

- Breaking change: web extensions need to change `use Disbatch::Web` to `use Disbatch::Web::TT`, and that should be it.
- `go-task-runner` is now the default task runner, and `bin/task_runner` can still be used by setting `task_runner` in the config file:
  - `plugins` is now an object and not an array: the keys are the plugin names and the values are `1` for Perl modules, or an object with `type` for programs. Change an array `[ "Disbatch::Plugin::Demo" ]` to `{ "Disbatch::Plugin::Demo": 1 }`
  - set `plugin_runner` to the full path of `bin/task_runner` to run Perl module plugins with `go-task-runner`
  - `temp_dir` (default `/tmp/disbatch`) and `temp_dir_mode` (default `"0755"`) are new
  - `disbatchd` and the task runner must run as the same user
  - if using MongoDB authentication, rerun `disbatch-create-users` with `--update_privileges`, as `task_runner` now needs `listIndexes` and `createIndex` for `tasks.files` and `tasks.chunks`
  - see [Plugins](Plugins.md)
- removed code deprecated in 4.200 and 4.000:
  - file `lib/Disbatch/Web/V3.pm` (Disbatch::Web::V3) : deprecated v3 routes: *-json, not tested
  - file `lib/Disbatch/Web/Tasks.pm` (Disbatch::Web::Tasks) : deprecated v4 routes: POST /tasks/search, POST /tasks/:queue, POST /tasks/:queue/:collection
  - `search` command and `post_search()` in `bin/disbatch` : used `Disbatch::Web::Tasks`
  - file `bin/disbatch.pl` : used `Disbatch::Web::V3`

### Upgrading from Disbatch 4.0 to Disbatch 4.4

Note the above. The JSON API is completely different. Web extensions were
new in 4.2.

#### Configure

For new features to work, the config file must be updated and
`disbatch-create-users` must be run again.

- For QueueBalance to work:
  - Add `auth.queuebalance` with a password to the config file
  - Set `balance.enabled` to `true` in the config file
  - Rerun `disbatch-create-users`

- For the new routes (`GET /tasks` and `GET /tasks/:id`) to work:
  - Rerun `disbatch-create-users`

- Rerun `disbatch-create-users`:
  - See `perldoc disbatch-create-users` for more options. If you did the
    default, the following should work fine:

            disbatch-create-users --config /etc/disbatch/config.json --root_user root --drop_roles

- Restart `disbatchd` and `disbatch-webd`, and start `queuebalanced` if used.

### Upgrading from Disbatch 3 to Disbatch 4.4

#### Preliminary steps

- Rename the tasks and queues collections to `tasks` and `queues` if they have
  different names

- Set each queue's `threads` to how many maximum concurrent threads should be
  run for that queue across all DENs. The queue field `maxthreads`, which
  applied per DEN, is no longer used.

- Run the following on each database, as the `constructor` field has been
  renamed to `plugin`:

        db.queues.update({}, {$rename: {constructor: "plugin"}})

- If using MongoDB authentication, make sure the `plugin` role has the proper
  permissions for any collections the plugin modifies.


#### Configure

See [Configuring](Configuring.md)

Consult `/etc/disbatch/disbatch.ini` for reference of current settings.


#### Modify your plugins:

- To support Disbatch 4:
  - Remove these lines:

            use Synacor::Disbatch::Task;
            use Synacor::Disbatch::Engine;
            our @ISA=qw(Synacor::Disbatch::Task);

  - Modify `new()`:

    The plugin was formerly instantiated as `new($queue, $parameters)`, and is
    now instantiated as `new(workerthread => $workerthread, task => $doc)`.

    See [Example `new()`](example-new) below.
  - Remove any `$Synacor::Disbatch::Engine::EventBus` call (namely,
    `report_task_done`).

    **Any other `EventBus` usage will no longer work.**
  - Finally, the task must return this when finished:

            {status => $status, stdout => $stdout, stderr => $stderr};

#### Example `new()`

Disbatch 3 was called via `new($queue, $parameters)`, with `$queue` containing
`{id => $queue_id}` and `$parameters` containing the task's parameters.

Disbatch 4 is called via `new(workerthread => $workerthread, task => $doc)`,
with `$workerthread` being a `Disbatch` object using the `plugin` MongoDB user
and role, and `$doc` being the task's document from MongoDB.

The below is from `lib/Disbatch/Plugin/Demo.pm`.

    sub new {
        my $class = shift;

        my $self = { @_ };
        warn Dumper $self->{task}{params};

        # back-compat, so as to not change Disbatch 3 plugins so much
        # stick all params in $self
        for my $param (keys %{$self->{task}{params}}) {
            next if $param eq 'workerthread' or $param eq 'task';
            $self->{$param} = $self->{task}{params}{$param};
        }
        $self->{queue_id} = $self->{task}{queue};
        $self->{id} = $self->{task}{_id};

        bless $self, $class;
    }
