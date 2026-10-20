/*
This software is Copyright (c) 2026 by Ashley Willis.

This is free software, licensed under:

  The Apache License, Version 2.0, January 2004

Shared code for the Go versions of the t/task-*.pl test plugins. ParamsResult is the Go version of t/ParamsResult.pm.
*/

package testplugin

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Config struct {
	MongoHost string            `json:"mongohost"`
	Database  string            `json:"database"`
	Auth      map[string]string `json:"auth"`
}

// Die prints the message to stderr and exits 255, like Perl's `die`
func Die(format string, a ...any) {
	message := fmt.Sprintf(format, a...)
	if !strings.HasSuffix(message, "\n") {
		message += "\n"
	}
	fmt.Fprint(os.Stderr, message)
	os.Exit(255)
}

// Mongo connects as the `plugin` user if `config.auth` has any users, and returns the database
func Mongo(configFile string) *mongo.Database {
	var config Config
	if text, err := os.ReadFile(configFile); err != nil {
		Die("could not read config file: %v", err)
	} else if err = json.Unmarshal(text, &config); err != nil {
		Die("could not parse config file: %v", err)
	}
	opts := options.Client().ApplyURI(config.MongoHost).SetMaxPoolSize(1).SetServerMonitoringMode("poll")
	opts.SetTimeout(30 * time.Second)
	if len(config.Auth) > 0 {
		opts.SetAuth(options.Credential{AuthSource: config.Database, Username: "plugin", Password: config.Auth["plugin"]})
	}
	client, err := mongo.Connect(opts)
	if err != nil {
		Die("could not connect to MongoDB: %v", err)
	}
	return client.Database(config.Database)
}

// Task returns the task with status 0 on this node. Only `_id` and `params` are decoded.
func Task(db *mongo.Database, taskID string) (bson.ObjectID, bson.M) {
	oid, err := bson.ObjectIDFromHex(taskID)
	if err != nil {
		Die("--task value error: %v", err)
	}
	node, err := os.Hostname()
	if err != nil {
		Die("could not get hostname: %v", err)
	}
	var doc struct {
		Params bson.M `bson:"params"`
	}
	if err = db.Collection("tasks").FindOne(context.Background(), bson.M{"_id": oid, "status": 0, "node": node}).Decode(&doc); err != nil {
		Die("Could not find task %v with status 0 on node %v: %v", taskID, node, err)
	}
	return oid, doc.Params
}

// Filter returns the filter for the task with this status on this node
func Filter(oid bson.ObjectID, status any) bson.M {
	node, _ := os.Hostname()
	return bson.M{"_id": oid, "status": status, "node": node}
}

// ParamsResult sets `status`, `stdout`, and `stderr` of the result to those in `params`, as is. Also:
// * `large_stdout` and `large_stderr` set `stdout` and `stderr` to that many "x" characters, and `quiet` in `extra`
// * `kill`, `die`, and `exit` happen right away, or are put in `extra` (for `Extra()`) if `wait` is true
func ParamsResult(params map[string]any) (result bson.M, extra map[string]any) {
	result = bson.M{}
	extra = map[string]any{}
	for param, value := range params {
		switch param {
		case "status", "stdout", "stderr":
			result[param] = value
		case "large_stdout", "large_stderr":
			result[strings.TrimPrefix(param, "large_")] = strings.Repeat("x", Int(value))
			extra["quiet"] = 1 // hacky, for handoff
		case "kill", "die", "exit":
			if Truthy(params["wait"]) {
				extra[param] = value
			} else {
				Extra(map[string]any{param: value})
			}
		}
	}
	return result, extra
}

// Extra does `kill`, `die`, and `exit` from `extra`, in that order
func Extra(extra map[string]any) {
	if value, ok := extra["kill"]; ok {
		exec.Command("kill", fmt.Sprintf("-%v", value), strconv.Itoa(os.Getpid())).Run()
	}
	if value, ok := extra["die"]; ok {
		Die("%v", value)
	}
	if value, ok := extra["exit"]; ok {
		os.Exit(Int(value))
	}
}

// PutLarge puts `stderr` and then `stdout` in GridFS once their combined size is over 15MB, replacing them with the `_id`
func PutLarge(db *mongo.Database, oid bson.ObjectID, result bson.M) {
	total := 0
	bucket := db.GridFSBucket(options.GridFSBucket().SetName("tasks"))
	for _, field := range []string{"stderr", "stdout"} {
		s, _ := result[field].(string)
		total += len(s)
		if len(s) != 0 && total > 1024*1024*15 {
			uploadOpts := options.GridFSUpload().SetMetadata(bson.M{"task_id": oid})
			if id, err := bucket.UploadFromStream(context.Background(), field, strings.NewReader(s), uploadOpts); err != nil {
				slog.Error("Could not create GridFS content", "taskID", oid.Hex(), "field", field, "err", err)
				result[field] = nil
			} else {
				result[field] = id
			}
		}
	}
}

// Int returns a number from JSON or BSON (or a string) as an `int`, or 0
func Int(value any) int {
	switch v := value.(type) {
	case json.Number:
		f, _ := v.Float64()
		return int(f)
	case int32:
		return int(v)
	case int64:
		return int(v)
	case float64:
		return int(v)
	case string:
		i, _ := strconv.Atoi(v)
		return i
	}
	return 0
}

// Truthy is Perl's idea of true: not null, 0, "", or "0"
func Truthy(value any) bool {
	switch v := value.(type) {
	case nil:
		return false
	case bool:
		return v
	case string:
		return v != "" && v != "0"
	case json.Number:
		f, err := v.Float64()
		return err != nil || f != 0
	case int32:
		return v != 0
	case int64:
		return v != 0
	case float64:
		return v != 0
	}
	return true
}
