/*
This software is Copyright (c) 2026 by Ashley Willis.

This is free software, licensed under:

  The Apache License, Version 2.0, January 2004

The Go version of t/task-handoff-raw.pl, a "handoff" test plugin that does no validation of its own, so the task runner's
validation can be tested. It sets the task's `status` (and `stdout` and `stderr`) to exactly what is given in `params`, and:
* does not touch the task document if `params` has none of `status`, `stdout`, `stderr`, so status stays 0
* unsets `status` if `params.unset_status` is true
*/

package main

import (
	"context"
	"flag"

	"go.mongodb.org/mongo-driver/v2/bson"

	"go-task-runner/t/testplugin"
)

func main() {
	var taskID, configFile string
	flag.StringVar(&taskID, "task", "", "task _id")
	flag.StringVar(&configFile, "config", "", "config file")
	flag.Bool("quiet", false, "not used")
	flag.Parse()

	if configFile == "" {
		testplugin.Die("Config file must be passed with --config option")
	}
	if taskID == "" {
		testplugin.Die("No --task")
	}

	db := testplugin.Mongo(configFile)
	oid, params := testplugin.Task(db, taskID)

	result, extra := testplugin.ParamsResult(params)

	update := bson.M{}
	if len(result) > 0 {
		update["$set"] = result
	}
	if testplugin.Truthy(params["unset_status"]) {
		update["$unset"] = bson.M{"status": 1}
	}
	if len(update) > 0 {
		if _, err := db.Collection("tasks").UpdateOne(context.Background(), testplugin.Filter(oid, 0), update); err != nil {
			testplugin.Die("Could not update task %v: %v", taskID, err)
		}
	}

	testplugin.Extra(extra)
}
