### Writing plugins for Disbatch 4

Copyright (c) 2016, 2026 by Ashley Willis.

There are two kinds of plugins:

* Perl modules, such as `Disbatch::Plugin::Demo`. See [Perl module
  plugins](#perl-module-plugins) below. For a simple example, see
  `lib/Disbatch/Plugin/Demo.pm`.

* Programs in any language: any executable that follows the contract in
  [Plugins as programs](#plugins-as-programs-for-go-task-runner). These are
  only run by `go-task-runner`.

Both are listed in `plugins` in the config file, and a queue's `plugin` is the
module name or full path to the program.

#### Task runners

`go-task-runner` is the default Disbatch Task Runner (DTR): `disbatchd` runs it
once per claimed task. It validates the plugin, runs it, validates the result,
and writes the task's `status`, `stdout`, and `stderr`.

`bin/task_runner` is still shipped, and can be used by setting `task_runner` in
the config file to its path. It can only run Perl module plugins, and it does
so directly instead of in another process. `go-task-runner` runs Perl module
plugins by running `bin/task_runner --handoff`, which is set via
`plugin_runner`. See [Running Perl module
plugins](#running-perl-module-plugins-with-go-task-runner).

#### Perl module plugins

##### Requirements

* Two subroutines: `new` and `run`

  * `new({workerthread => $workerthread, task => $doc})`

    `$workerthread` is a `Disbatch` object using the `plugin` MongoDB user and
    role. This gives access to the Disbatch subroutines, such as `logger`,
    `mongo`, and the various collection helper subs (`nodes`, `queues`,
    `tasks`), with whatever MongoDB access permissions `plugin` has.

    `$doc` is the task's full document from MongoDB, where `$doc->{_id}` and
    `$doc->{queue}` are `BSON::OID` objects.

  * `run()`

    This must return a HASH, and the HASH should contain the keys `status`,
    `stdout`, and `stderr`.

    The value of `status` must be a positive integer, where `1` indicates
    success, and generally `2` to indicate failure.  If not, it will be set as
    `2`.

    The values of `stdout` and `stderr` should be simple scalars (strings or
    `undef`), and will be forced to be strings.

##### Task Params

Anything for a particular task can be here. For email migrations, we typically
have the following key names: `client`, `migration`, `user1`, `user2`, and
`commands`.

* `client` defines the client name that the user is part of, as some plugins
  work for multiple clients
* `migration` is a string to identify a group of migration tasks. You can also
  use queues alone for this purpose.
* `user1` and `user2` identify the source and destination email accounts. Rarely
  will they differ, outside of testing.
* `commands` is a string where each character signifies a step in the migration
  process, or `*` to signify all the standard steps needed. For each step,
  `commands` is checked against a regex. An array of commands with descriptive
  names could also be used.

The `params` object may also contain additional name/value pairs for special
options.

##### Recommendations

* `finish()`

  As shown in `lib/Disbatch/Plugin/Demo.pm`, there is a `finish` subroutine,
  which handles all the finalization of the task and returning the task's
  `status`, `stdout`, and `stderr`. The finalization is typically saving a
  report for this task in the `reports` collection. In the event of an error, a
  command's step will set the status to `2` to indicate failure, call
  `finish()`, and return the result. If the end of `run()` is reached, then
  `finish()` will be called (at the beginning of `run()`, the status is set to
  `1` to indicate success).

* Reports

  A report typically contains the important identifying params of the task
  (`migration`, `user1`, `user2`, and `commands`), as well as the task and queue
  ids, the start and end times of the task, the plugin version used, the status
  of the task, a count of any errors encounted, and a simple string identifying
  an error which caused a failure of a task.

  This is written to the `reports` collection, so the `plugin` MongoDB user and
  role needs to have the `insert` permission.

* Accessing and updating other MongoDB collections

  You may need to find, update, or insert documents in other collections. The
  `plugin` role by default can read all collections in the database it has
  access to. Add `insert`, `update`, and possibly `createIndex` permissions to
  the role as appropriate.

  Within the plugin, you can access these collections with the following:

        $self->{workerthread}->mongo->get_collection($name)

##### Running Perl module plugins with `go-task-runner`

A `plugins` value of `1` means a Perl module plugin:

        "plugins": {
            "Disbatch::Plugin::Demo": 1
        }

`go-task-runner` treats these as plugins of type `handoff`. It runs
`config.plugin_runner` (the full path to `bin/task_runner`, such as
`/usr/bin/task_runner`) with `--handoff`, and that loads the module, runs it,
validates the result, and saves it to the task. This allows queues of Perl
module plugins and queues of programs to run on the same DEN.

`plugin_runner` defaults to `/usr/bin/task_runner`. If it is not a full path to
an executable file, the task fails with status `2` and `Unable to start` for
`stdout`.

#### Plugins as programs for `go-task-runner`

A plugin can be any executable program. Add its full path to `plugins`, with
its type, and use the same full path as the `plugin` of the queue:

        "plugins": {
            "/usr/local/bin/migrate-user": {},
            "/usr/local/bin/migrate-fast": {"type": "nomongo"},
            "/usr/local/bin/migrate-big": {"type": "mongo"},
            "/usr/local/bin/migrate-full": {"type": "handoff"}
        }

The value is an object with the optional key `type`, which is one of `default`
(if `type` is not given), `nomongo`, `mongo`, or `handoff`. The path must be
absolute and the file must be executable by the user `go-task-runner` runs as
(see [Running](Running.md)), or the task fails with status `2`.

The types differ in how the program gets its task and returns its result:

| type      | task passed as      | `--config` passed | result returned via       | plugin finalizes task |
| --------- | ------------------- | ----------------- | ------------------------- | --------------------- |
| `default` | JSON file           | yes               | JSON file                 | no                    |
| `nomongo` | JSON file           | no                | JSON file                 | no                    |
| `mongo`   | task `_id`          | yes               | document in `results`     | no                    |
| `handoff` | task `_id`          | yes               | the task document itself  | yes                   |

Use `default` or `nomongo` unless you have a reason not to: they use the local
filesystem, so you do not need to worry about the size of the result, and
`nomongo` programs need no MongoDB driver. `mongo` creates extra load on
MongoDB for the `results` collection, and the plugin needs to deal with large
results itself. `handoff` writes the result right where it belongs but the
plugin has to do everything.

The program's own standard output and standard error are not the task's
`stdout` and `stderr`: they are inherited from the runner. The exit code of the
program is recorded in the task document as `cmdExit` and `cmdErr`, and a
non-zero exit code has consequences described in [When the result is
invalid](#when-the-result-is-invalid-or-the-plugin-fails).

##### Arguments

* `--config FILE` (`default`, `mongo`, and `handoff`)

  A copy of the config file whose `auth` has only the password for the
  `plugin` MongoDB user. `disbatchd` creates it on startup, next to the config
  file, named with `-plugin` added to the end (so
  `/etc/disbatch/config.json-plugin` for `/etc/disbatch/config.json`). Connect
  to MongoDB with the `plugin` user and this config's `mongohost`, `database`,
  and `attributes`. `nomongo` programs are not passed this.

* `--task FILE` (`default` and `nomongo`)

  The full path to the task file, `TEMP_DIR/TASK_ID.json`.

* `--task ID` (`mongo` and `handoff`)

  The task's `_id` as a 24 character hex string.

* `--quiet` (`handoff` only)

  Passed if the runner was run with `--quiet`. Suppress your `STDOUT` and
  `STDERR` output at the end.

##### Valid results

A valid result has:

* `status`: a positive integer. `1` means the task succeeded, and any larger
  integer means the task failed (generally `2`).

* `stdout` and `stderr`: optional. Strings, or `null`.

A task that fails because of a problem with the task itself should return a
valid result with a status greater than `1` and exit with `0`. It should not
exit non-zero.

##### Type `default` and `nomongo`

The program is run with `--task TEMP_DIR/TASK_ID.json` and, for `default`,
`--config FILE`. `TEMP_DIR` is `temp_dir` from the config file.

* The task file is the full task document as JSON, as it was when the runner
  claimed it (so `status` is `-1`). `_id` and `queue` are strings, and `ctime`
  and `mtime` are strings like `2026-10-07T01:52:06.06Z`.

* The program must write its result as a JSON object to
  `TEMP_DIR/TASK_ID-response.json`: the task file's name with `.json` replaced
  by `-response.json`. Any keys other than `status`, `stdout`, and `stderr` are
  ignored.

* The runner deletes both files when the program has exited, and also before
  starting it in case there are old ones. The task file is created with mode
  `0600`.

* The runner stores `stdout` and `stderr` in GridFS if they are large (see
  below).

Example response file:

        {"status": 1, "stdout": "migrated 3 mailboxes\n", "stderr": ""}

##### Type `mongo`

The program is run with `--config FILE --task TASK_ID`.

* Read the task from the `tasks` collection: `{_id: TASK_ID, status: 0, node:
  HOSTNAME}`. The task's `params` are what you need.

* Insert the result as a document in the `results` collection, with the same
  `_id` as the task, and the keys `status`, `stdout`, and `stderr`.

* The runner removes any old document for the task from `results` before
  starting the program, and removes the new one after it exits, so `results`
  should stay empty. Any keys other than `status`, `stdout`, and `stderr` are
  ignored.

* The `plugin` MongoDB role (set in `plugin-permissions.json`) needs `find`
  for `tasks` and `insert` for `results`.

* A document cannot be more than 16MB. If your `stdout` and `stderr` can be
  large, you must put them in GridFS yourself (see below), and use the
  `ObjectId` of the file as the value.

See `t/task-mongo.pl` for an example.

##### Type `handoff`

The program is run with `--config FILE --task TASK_ID`, and `--quiet` if
needed.

* Read the task from the `tasks` collection: `{_id: TASK_ID, status: 0, node:
  HOSTNAME}`.

* When finished, update that task: set `status`, `stdout`, and `stderr`, and
  set `complete` to `true`. Set `status` before you set the others, with a
  filter that includes `status: 0` and `node: HOSTNAME`. The rest should use a
  filter that includes the new `status` and the same `node`.

* You are responsible for all of the finalizing. This includes putting large
  `stdout` and `stderr` in GridFS (see below), and setting `complete` to `true`
  when the task is completely written.

* Do not change the task's `node` or `mtime`: the runner uses them to find the
  task.

* The `plugin` MongoDB role (set in `plugin-permissions.json`) needs `find`
  and `update` for `tasks`, and the permissions for any GridFS use.

* The runner does nothing more if the task has a valid `status` greater than
  `1`, or a status of `1` and the program exited with `0`.

See `t/task-handoff.pl` for an example. This is also what the Perl
`bin/task_runner --handoff` does for Perl module plugins.

##### Large `stdout` and `stderr` and GridFS

A task document cannot be more than 16MB, so large output is put in GridFS (see
[Design](Design.md)).

* The sizes of `stderr` and then `stdout` are totalled. When the total goes
  over 15MiB (15\*1024\*1024 bytes), that field and any non-empty field after it
  are put in GridFS, and its value in the task is the `ObjectId` of the GridFS
  file. `stderr` is preferred to stay in the task document as it is more likely
  to be parsed on a failure. If `stderr` itself needs GridFS, so does a
  non-empty `stdout`.

* `go-task-runner` does this for `default` and `nomongo`. Plugins of type
  `mongo` and `handoff` need to do it themselves, as shown in `t/task-mongo.pl`
  and `t/task-handoff.pl`. The files are in the bucket `tasks`, are named
  `stdout` or `stderr`, and have `metadata: { task_id: TASK_ID }`.

* The runner needs `listIndexes`, as well as `insert`, for `tasks.files` and
  `tasks.chunks`: `disbatch-create-users` does this. Plugins writing to GridFS
  need `insert` there, and `find` and `listIndexes` as well for the first file
  in an empty bucket, added in `plugin-permissions.json`. Neither needs
  `createIndex`, as `disbatchd` creates the indexes the MongoDB drivers want
  when it starts.

##### When the result is invalid or the plugin fails

The task is always finished, and failed with status `2` instead of being left
running. The runner logs an error, and the task document gets the following:

* The program exits non-zero, or is killed or cannot be started

  `cmdExit` and `cmdErr` are saved in the task document. This is not a failure
  by itself:

  * If `status` is greater than `1`, the result is kept, and a warning is
    logged.

  * If `status` is `1`, it becomes `2`. `stdout` becomes the result as Extended
    JSON, and `stderr` becomes `plugin returned status:1 but did not exit
    cleanly (see stdout for any stdout or stderr it may have set)`.

  * If the program was killed, never saved a result, or could not start, then
    the other cases below apply.

* `status` is missing, is not an integer (such as a string, `1.5`, or
  infinity), is `0`, or is negative

  `status` becomes `2`. `stdout` becomes the result as Extended JSON (so you can
  see what was returned), and `stderr` says what was wrong, such as `plugin
  returned unknown type for status (see stdout for status and any stdout or
  stderr it may have set)`.

* `default` and `nomongo`: the response file is missing, or is not valid JSON

  `status` becomes `2`, and `stderr` says `could not read task plugin response
  file: ...` or `plugin saved non-json in response file (see stdout for any
  content it may have set)`. In the second case, `stdout` is the content of the
  file.

* `mongo`: there is no document in `results` for the task

  `status` becomes `2`, and `stderr` is `plugin did not create a document in
  'results'`.

* `handoff`: `status` was left at `0`

  `status` becomes `2`, `stdout` is the task's `status`, `stdout`, and `stderr`
  as Extended JSON, and `stderr` is `plugin did not update status (see stdout
  for any stdout or stderr it may have set)`.

The task cannot be started if the queue is not found, has no `plugin`, the
`plugin` is not a full path (or `plugin_runner` for a Perl module plugin), is
not found or is not executable, or has a type that is not valid. `status` is
`2`, `stdout` is `Unable to start`, `stderr` is the reason, and `cmdExit` and
`cmdErr` are not set. This is the same for `bin/task_runner`.

If the runner cannot claim the task (it is not `status: -1` on this node), it
exits `1` and does not change the task.

##### Task document fields set by the runner

See [Design](Design.md#tasks) for `complete`, `cmdExit`, and `cmdErr`.
