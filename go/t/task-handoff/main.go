/*
This software is Copyright (c) 2026 by Ashley Willis.

This is free software, licensed under:

  The Apache License, Version 2.0, January 2004

The Go version of t/task-handoff.pl, a "handoff" test plugin. Like `bin/task_runner --handoff`, it validates the status,
logs the result, and writes it to the task document.
*/

package main

import (
	"context"
	"flag"
	"fmt"
	"log/slog"
	"math"
	"os"
	"regexp"
	"strconv"
	"strings"

	"go.mongodb.org/mongo-driver/v2/bson"

	"go-task-runner/t/testplugin"
)

func main() {
	var taskID, configFile string
	var quiet bool
	flag.StringVar(&taskID, "task", "", "task _id")
	flag.StringVar(&configFile, "config", "", "config file")
	flag.BoolVar(&quiet, "quiet", false, "do not print the result to stderr")
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
	if q, ok := extra["quiet"]; ok {
		quiet = testplugin.Truthy(q)
	}

	// status must be a positive integer, otherwise the task fails
	status, ok := positive(result["status"])
	if !ok {
		slog.Error(fmt.Sprintf("Task %s returned other than a positive integer as status: '%v'", taskID, result["status"]))
		status = 2
	}
	result["status"] = status

	if status == 1 {
		slog.Info(fmt.Sprintf("Task %s succeeded.", taskID))
	} else {
		slog.Info(fmt.Sprintf("Task %s failed.", taskID))
	}
	if !quiet {
		for _, field := range []string{"stdout", "stderr"} {
			value := "null"
			if result[field] != nil {
				value = strings.TrimSuffix(fmt.Sprint(result[field]), "\n")
			}
			fmt.Fprintf(os.Stderr, "%s: %s\n", strings.ToUpper(field), value)
		}
	}

	// set status first:
	if _, err := db.Collection("tasks").UpdateOne(context.Background(), testplugin.Filter(oid, 0), bson.M{"$set": bson.M{"status": status}}); err != nil {
		testplugin.Die("Could not update task %v status to %v after completion: %v", taskID, status, err)
	}

	// set rest of result:
	testplugin.PutLarge(db, oid, result)
	update := bson.M{"$set": bson.M{"stdout": result["stdout"], "stderr": result["stderr"]}}
	if _, err := db.Collection("tasks").UpdateOne(context.Background(), testplugin.Filter(oid, status), update); err != nil {
		testplugin.Die("Could not update task %v stdout/stderr after completion: %v", taskID, err)
	}

	testplugin.Extra(extra)
}

var positiveInteger = regexp.MustCompile(`^[1-9][0-9]*$`)

// positive returns the status as an `int32` if it is a positive integer (or a string of one, like Perl), as
// `go-task-runner` needs `status` to be an `int32`
func positive(value any) (int32, bool) {
	var f float64
	switch v := value.(type) {
	case int32:
		f = float64(v)
	case int64:
		f = float64(v)
	case float64:
		f = v
	case string:
		if !positiveInteger.MatchString(v) {
			return 0, false
		}
		var err error
		if f, err = strconv.ParseFloat(v, 64); err != nil {
			return 0, false
		}
	default:
		return 0, false
	}
	if f < 1 || f > math.MaxInt32 || f != math.Trunc(f) {
		return 0, false
	}
	return int32(f), true
}
