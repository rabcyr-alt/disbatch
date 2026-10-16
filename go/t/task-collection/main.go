/*
This software is Copyright (c) 2026 by Ashley Willis.

This is free software, licensed under:

  The Apache License, Version 2.0, January 2004

The Go version of t/task-collection.pl, a "collection" test plugin.
*/

package main

import (
	"context"
	"flag"

	"go-task-runner/t/testplugin"
)

func main() {
	var taskID, configFile string
	flag.StringVar(&taskID, "task", "", "task _id")
	flag.StringVar(&configFile, "config", "", "config file")
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
	result["_id"] = oid

	testplugin.PutLarge(db, oid, result)

	// `no_result` skips this, so tests can make a plugin that does not create a result:
	if !testplugin.Truthy(params["no_result"]) {
		if _, err := db.Collection("results").InsertOne(context.Background(), result); err != nil {
			testplugin.Die("Could not insert results for task %v with status %v after completion: %v", taskID, result["status"], err)
		}
	}

	testplugin.Extra(extra)
}
