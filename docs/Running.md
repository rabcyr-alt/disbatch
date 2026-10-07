### Running Disbatch 4

Copyright (c) 2016, 2019, 2026 by Ashley Willis.

* [Configure](Configuring.md) Disbatch before running

* Start, stop, restart

  * On each server you want Disbatch running:

            /etc/init.d/disbatchd [start|stop|restart]

  * On each server you want the Disbatch Command Interface running:

            /etc/init.d/disbatch-webd [start|stop|restart]

    This can run on the same servers as `disbatchd`, or on completely different
    ones.

* Task runner

  * `disbatchd` starts a task runner for each task it claims: `go-task-runner`
    by default, or whatever `task_runner` is set to in the config file. The
    Perl `bin/task_runner` can be used instead by setting `task_runner`, but it
    can only run Perl module plugins.

  * `disbatchd` and the task runner (and so the plugins) must run as the same
    user. It does not need to be `root`, and is better not to be. The task
    runner uses files `disbatchd` creates as that user: the config files
    `config.json-task_runner` and `config.json-plugin` (mode `0600`), and
    `temp_dir` (default `/tmp/disbatch`), where it writes the task and response
    files for plugins of type `default` and `nomongo`. It also appends to the
    log file in the same way `disbatchd` does. If you run the task runner by
    hand, such as to debug a task, run it as that user:

            go-task-runner --task 565bc0d43fb6ecd1c8504492 --config /etc/disbatch/config.json-task_runner

    The task must have `status` `-1` and `node` set to this host's name, as
    `disbatchd` would have set when claiming it. If not, the task runner exits
    with `1` and does not change the task.

  * A plugin is run as a separate process. A plugin that runs longer than you
    want must be handled by the plugin: the task runner waits for it to exit.

  * See [Plugins](Plugins.md) for how plugins are run, and what happens when
    one fails.

* Web interface, by default listening on 127.0.0.1:8080

  * Create a new queue by clicking on `New Queue`, entering a `Name`, selecting
    a `Type` from the drop-down menu, and clicking `Create`.

  * Modify an existing queue by clicking on its `Type`, `Name`, or `Threads`.
    `Threads` is the number of concurrent tasks to run from this queue **across
    all DENs**. You cannot delete a queue from the web interface.

  * To limit the total number of concurrent tasks to run per DEN, set `Max
    Threads` for that DEN in the `Disbatch Execution Nodes` table. This will
    take precedence over any queue `Threads` settings. To disable a DEN's `Max
    Threads` value, delete the value from the table. If you set it to `0`, no
    threads will run.

  * You can refresh the tables at any time by clicking on `Refresh`. They also
    refresh automatically every 30 seconds (configurable via
    `dashboard.refresh_ms`), and after any changes via the web interface.

  * The dashboard splits DENs into "Disbatch Execution Nodes" (live) and
    "Non-Running Disbatch Execution Nodes" (dead). A node is live if it has
    reported within the last 15 seconds by default (configurable via
    `dashboard.live_window_ms`); DENs report every 1 second, so 15 seconds is a
    reasonable "alive right now" threshold. The classification is made by the
    server against its own clock, so browser clock skew can't flip a node
    live/dead.

* QueueBalance

  * See [QueueBalance](QueueBalance.md) on how to use the tool for
    automatically maintaining a maximum number of threads across queues depending
    on the time of day and day of week.

* Monitoring

  * Disbatch now has a `GET /monitoring` endpoint as part of the web interface to
    check the status of Disbatch and QueueBalance. See `perldoc Disbatch::Web`
    for a full description.

* CLI

  * With `disbatch`, you can list queues, create queues, modify max threads
    of queues, create a single task in a queue, create many tasks in a queue
    based off a filter from another collection, search for tasks in a queue, and
    list queue plugin types available.

  * For a full description, run `perldoc disbatch`

  * If the Disbatch Command Interface is not running on `http://localhost:8080`,
    pass the URL with the `--url` option.
