### Configuring Disbatch 4.4

Copyright (c) 2016, 2019, 2026 by Ashley Willis.

#### Configure `/etc/disbatch/config.json`
1. Copy `/etc/disbatch/config.json-example` to `/etc/disbatch/config.json`
2. Make sure that only the process running Disbatch can read and edit
   `/etc/disbatch/config.json`
3. Edit `/etc/disbatch/config.json`
   1. Change `mongohost` to the URI of your MongoDB servers, including TLS options
   2. Change `database` to the MongoDB database name you are using for Disbatch
   3. Ensure proper TLS settings in `tls` for the DCI, or remove it if not using TLS
   4. Change passwords in `auth` for the respective MongoDB users, or delete
      the field or set its value to `null` if not using MongoDB authentication
   5. Set `plugins` to the plugins you want accessible for queue creation:
      the name of each Perl module with a value of `1`, and the full path of
      each program with an object that has its `type` (see
      [Plugins](Plugins.md))
   6. Set `monitoring` to `false` if you want `GET /monitoring` to ignore checks
   7. Set `balance.enabled` to `true` if using QueueBalance
   8. Uncomment `pre_hook` section if using a pre_hook plugin
   9. Set `activequeues` or `ignorequeues` per DEN if used
   10. Set `node_increase` and/or `queue_increase` to throttle thread increases
   11. Remove the rest, which is optional and configured for development

See also [Configuring and Using TLS with MongoDB](TLS_MongoDB.md) and
[Configuring and Using TLS with the Disbatch Command Interface](TLS_DCI.md).

#### Create MongoDB users for Disbatch if using authentication
- Configure the permissions your plugin needs in
  `/etc/disbatch/plugin-permissions.json`.
- If your MongoDB `root` user has a different name, pass that to `--root_user`.
  If no users exist yet, also pass `--create_root`. See the perldoc for more
  info.

        disbatch-create-users --config /etc/disbatch/config.json --root_user root

See also [Configuring and Using Authentication with MongoDB](Authentication_MongoDB.md).
