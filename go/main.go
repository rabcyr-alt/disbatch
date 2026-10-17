/*
This software is Copyright (c) 2026 by Ashley Willis.

This is free software, licensed under:

  The Apache License, Version 2.0, January 2004

See `perldoc go-task-runner.pod` for instructions
*/

package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"log/slog"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func main() {
	os.Exit(run())
}

func run() int {
	var r Runner
	err := r.setup()
	defer func() {
		if r.db != nil {
			r.db.Client().Disconnect(context.Background()) // disconnect because idle sessions stay around for 30 minutes on the server
		}
	}()
	if err != nil {
		slog.Error(err.Error())
		return 1
	}

	if err = r.setTaskRunnerDoc(); err != nil {
		slog.Error(err.Error())
		return 1
	}

	var filter bson.M
	var result bson.M // NOTE: should always have `status` (positive integer) and optional `stdout` and `stderr` (string, maybe nil)
	if err := r.setPlugin(); err != nil {
		slog.Error(err.Error())
		result = bson.M{"status": 2, "stdout": "Unable to start", "stderr": err.Error()}
	} else if cargs, taskFile, responseFile, err := r.createCommandArgs(); err != nil {
		result = bson.M{"status": 2, "stdout": "Unable to start", "stderr": err.Error()}
	} else {
		r.cmdExit, r.cmdErr = runCommand(r.plugin, cargs) // 0 on success, err != nil on failure
		r.recordPluginExit()
		switch r.pluginType {
		case "handoff":
			if result, filter, err = r.processHandoffResult(); err != nil {
				slog.Error(err.Error())
				return 1
			} else if result == nil {
				return 0
			}
		case "collection":
			result = r.processCollectionResult()
		default: // "file"
			result = r.processFileResult(taskFile, responseFile)
		}
	}
	if err := r.finish(result, filter); err != nil {
		slog.Error(err.Error())
		return 1
	}
	return 0
}

func (r *Runner) setup() error {
	flag.StringVar(&r.taskID, "task", "", "The task's _id. Mandatory.")
	flag.StringVar(&r.configFile, "config", "", "Path to the JSON Disbatch config file. Mandatory.")
	flag.BoolVar(&r.quiet, "quiet", false, "Suppress STDOUT and STDERR output at end (mainly for testing).")
	flag.BoolVar(&r.testing, "testing", false, "Passed to the Perl task runner with --handoff when running a Perl module plugin, and set `complete` when setting `stdout` and `stderr`.")
	flag.Parse()
	// flag.Args() is everything else, a slice, and can be passed an index for individual values

	if r.configFile == "" {
		return errors.New("config file must be passed with --config")
	}

	if byteValue, err := os.ReadFile(r.configFile); err != nil {
		return fmt.Errorf("could not read config file: %w", err)
	} else if err = json.Unmarshal(byteValue, &r.config); err != nil {
		return fmt.Errorf("could not parse config file %s: %w", r.configFile, err)
	}

	if err := logger(r.config); err != nil {
		return fmt.Errorf("could not set up logger: %w", err)
	}

	if r.taskID == "" {
		return errors.New("task ID must be passed with --task")
	}

	var err error
	r.node, err = os.Hostname()
	if err != nil {
		return fmt.Errorf("could not get hostname: %w", err)
	}

	r.db, err = mongodb(r.config)
	if err != nil {
		return fmt.Errorf("could not connect to MongoDB: %w", err)
	}

	slog.Info(fmt.Sprintf("Starting task %s", r.taskID))

	r.oid, err = bson.ObjectIDFromHex(r.taskID)
	if err != nil {
		return fmt.Errorf("invalid --task value %q: %w", r.taskID, err)
	}

	return nil
}

func (r *Runner) setTaskRunnerDoc() error {
	filter := bson.M{"_id": r.oid, "status": -1, "node": r.node}
	update := bson.M{"$set": bson.M{"status": 0}}
	if err := r.db.Collection("tasks").FindOneAndUpdate(context.Background(), filter, update).Decode(&r.doc); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return fmt.Errorf("could not find task %s to set status 0", r.taskID)
		}
		return fmt.Errorf("unknown issue trying to find and update task %s to status 0: %w", r.taskID, err)
	}
	slog.Info(fmt.Sprintf("params for %s: %s", r.taskID, r.doc["params"]))
	return nil
}

func (r *Runner) setPlugin() error {
	var queue bson.M
	if err := r.db.Collection("queues").FindOne(context.Background(), bson.M{"_id": r.doc["queue"]}).Decode(&queue); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return fmt.Errorf("queue %v not found for task %v", r.doc["queue"], r.taskID)
		} else {
			return fmt.Errorf("unknown issue querying for queue %v for task %v: %w", r.doc["queue"], r.taskID, err)
		}
	} else {
		var ok bool
		r.plugin, ok = queue["plugin"].(string)
		if !ok {
			return fmt.Errorf("no plugin defined for task %v in queue %v", r.taskID, r.doc["queue"])
		} else {
			pluginArgs := r.config.Plugins[r.plugin]
			r.isModule = pluginArgs.IsModule
			r.pluginType = pluginArgs.Type
			if r.isModule {
				r.pluginType = "handoff" // was "module", allows `go-task-runner` to run `bin/task_runner --handoff` for mixed plugin queues
				r.plugin = r.config.PluginRunner
			}
			// validate `r.plugin` and `r.pluginType`. we also validate `r.config.PluginRunner` value here as `r.plugin` when `r.isModule` is true
			if !filepath.IsAbs(r.plugin) {
				return fmt.Errorf("plugin value '%v' for task %v must be a full path", r.plugin, r.taskID)
			} else if fileinfo, ferr := os.Stat(r.plugin); ferr != nil || !fileinfo.Mode().IsRegular() || fileinfo.Mode().Perm()&0111 == 0 {
				return fmt.Errorf("%v not found or not executable for task %v", r.plugin, r.taskID)
			} else if !slices.Contains([]string{"file", "collection", "handoff"}, r.pluginType) {
				return fmt.Errorf("%v has unknown type '%v' for task %v", r.plugin, r.pluginType, r.taskID)
			}
		}
	}
	return nil
}

func (r *Runner) createCommandArgs() ([]string, string, string, error) {
	// types: file collection handoff
	// * file:       optional mongo access, passes task and result via /tmp/r.taskID.json
	//               uses local filesystem, don't have to worry about result size
	// * collection: reads task from mongo via r.taskID, saves result in "results" collection and this copies to "tasks" collection
	//               uses an additional collection creating extra load on mongo, have to worry about result size if it can exceed ~16MB, but no temp files
	// * handoff:    reads task from mongo via r.taskID, saves result in "tasks" collection and this exits
	//               writes result right where it belongs, have to worry about result size if it can exceed ~16MB, have to deal with all other finalizing
	var cargs []string
	cf := r.configFile
	// if r.isModule, we're handing off to the perl task runner, so whatever config we're using here is good
	if !r.isModule {
		// don't trust the plugin with any passwords except for "plugin"
		cf = r.configFile + "-plugin" // unlikely, but in case it has no suffix
		for _, ext := range []string{"-strict", "-task_runner", "-plugin"} {
			if name, ok := strings.CutSuffix(r.configFile, ext); ok {
				cf = name + "-plugin"
				break
			}
		}
	}
	cargs = append(cargs, "--config", cf)
	taskFile := filepath.Join(r.config.TempDir, r.taskID+".json")
	responseFile := filepath.Join(r.config.TempDir, r.taskID+"-response.json")
	if r.pluginType == "file" {
		var jsonTask []byte
		var err error
		if jsonTask, err = json.Marshal(r.doc); err != nil {
			slog.Error("could not create json from task doc", "taskID", r.taskID, "err", err)
			return nil, "", "", fmt.Errorf("could not create json from task doc: %w", err)
		}
		if err = os.Remove(taskFile); err != nil && !errors.Is(err, os.ErrNotExist) { // this shouldn't exist, but in case it does
			slog.Error("could not remove old task file", "file", taskFile, "err", err)
			return nil, "", "", fmt.Errorf("could not remove old task file: %w", err)
		}
		if err = os.Remove(responseFile); err != nil && !errors.Is(err, os.ErrNotExist) { // this shouldn't exist, but in case it does
			slog.Error("could not remove old response file", "file", responseFile, "err", err)
			return nil, "", "", fmt.Errorf("could not remove old response file: %w", err)
		}
		if err = os.WriteFile(taskFile, jsonTask, 0600); err != nil {
			slog.Error("could not create task file", "file", taskFile, "err", err)
			return nil, "", "", fmt.Errorf("could not create task file: %w", err)
		}
		cargs = append(cargs, "--task", taskFile)
	} else {
		cargs = append(cargs, "--task", r.taskID)
		if r.pluginType == "handoff" {
			if r.quiet {
				cargs = append(cargs, "--quiet")
			}
			if r.isModule {
				cargs = append(cargs, "--handoff")
				if r.testing {
					cargs = append(cargs, "--testing")
				}
			}
		} else if r.pluginType == "collection" {
			if _, err := r.db.Collection("results").DeleteOne(context.Background(), bson.M{"_id": r.oid}); err != nil {
				slog.Error("could not delete any pre-existing result for task in 'results' collection", "taskID", r.taskID, "err", err)
				return nil, "", "", fmt.Errorf("could not delete any pre-existing result for task in 'results' collection: %w", err)
			}
		}
	}
	return cargs, taskFile, responseFile, nil
}

func (r *Runner) recordPluginExit() {
	if r.cmdErr != nil {
		// if r.cmdExit < 0, then result likely not saved
		// * r.cmdExit -3 means start failed, -2 means wait failed (not sure how), -1 means killed
		// if r.cmdExit > 0, then perhaps saved perhaps not (a task should not exit non-zero when the task fails–it should set status to 2)
		slog.Error("plugin did not exit cleanly", "plugin", r.plugin, "taskID", r.taskID, "cmdExit", r.cmdExit, "cmdErr", r.cmdErr)
	} else {
		// r.cmdExit is 0, no error
		slog.Info("plugin exited cleanly", "plugin", r.plugin, "taskID", r.taskID)
	}
	// put `r.cmdExit` and `r.cmdErr` into the task doc
	if res, err := r.db.Collection("tasks").UpdateOne(context.Background(), bson.M{"_id": r.oid, "node": r.node, "mtime": r.doc["mtime"]}, bson.M{"$set": bson.M{"cmdExit": r.cmdExit, "cmdErr": fmt.Sprintf("%v", r.cmdErr)}}); err != nil {
		slog.Error("unknown issue updating task to set 'cmdExit' and 'cmdErr'", "taskID", r.taskID, "mtime", r.doc["mtime"], "err", err)
	} else if res.MatchedCount == 0 {
		slog.Error("could not find task to set 'cmdExit' and 'cmdErr'", "taskID", r.taskID, "mtime", r.doc["mtime"])
	}
}

func (r *Runner) processHandoffResult() (bson.M, bson.M, error) {
	var task bson.M
	var filter bson.M
	opts := options.FindOne().SetProjection(bson.M{"_id": 0, "status": 1, "stdout": 1, "stderr": 1})
	if err := r.db.Collection("tasks").FindOne(context.Background(), bson.M{"_id": r.oid, "node": r.node, "mtime": r.doc["mtime"]}, opts).Decode(&task); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil, fmt.Errorf("could not find handoff task %s with mtime %v to validate status", r.taskID, r.doc["mtime"])
		}
		return nil, nil, fmt.Errorf("unknown issue querying for handoff task %s with mtime %v to validate status: %w", r.taskID, r.doc["mtime"], err)
	}
	// `status` from mongo is type `int32`
	if status, ok := task["status"].(int32); !ok {
		// bad plugin! status not int32. make it a failure
		slog.Error("plugin returned unknown type for status", "plugin", r.plugin, "taskID", r.taskID, "status", task["status"], "type", fmt.Sprintf("%T", task["status"]), "cmdExit", r.cmdExit, "cmdErr", r.cmdErr)
		stdout, merr := bson.MarshalExtJSON(task, false, false)
		if merr != nil {
			slog.Error("could not marshal plugin result", "err", merr)
		}
		result := bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin returned unknown type for status (see stdout for status and any stdout or stderr it may have set)"}
		filter = bson.M{"_id": r.oid, "status": task["status"], "node": r.node, "mtime": r.doc["mtime"]} // filter for set status, need to query on status:task["status"]
		return result, filter, nil
	} else if status == 0 {
		// plugin didn't finish. make it a failure
		slog.Error("plugin did not update status", "plugin", r.plugin, "taskID", r.taskID, "cmdExit", r.cmdExit, "cmdErr", r.cmdErr)
		stdout, merr := bson.MarshalExtJSON(task, false, false)
		if merr != nil {
			slog.Error("could not marshal plugin result", "err", merr)
		}
		result := bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin did not update status (see stdout for any stdout or stderr it may have set)"}
		return result, filter, nil
	} else if status == int32(1) {
		if r.cmdErr == nil {
			return nil, nil, nil
		}
		// bad plugin! status == 1 but plugin exit code non-0. make it a failure
		slog.Error("plugin returned status:1 but did not exit cleanly", "plugin", r.plugin, "taskID", r.taskID, "cmdExit", r.cmdExit, "cmdErr", r.cmdErr)
		stdout, merr := bson.MarshalExtJSON(task, false, false)
		if merr != nil {
			slog.Error("could not marshal plugin result", "err", merr)
		}
		result := bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin returned status:1 but did not exit cleanly (see stdout for any stdout or stderr it may have set)"}
		filter = bson.M{"_id": r.oid, "status": 1, "node": r.node, "mtime": r.doc["mtime"]} // filter for set status, need to query on status:1
		return result, filter, nil
	} else if status > int32(1) {
		// good: task failed.
		if r.cmdErr != nil {
			// log that even though the handoff plugin set a proper failure status, it did not exit cleanly
			slog.Warn("plugin returned status>1 but did not exit cleanly", "plugin", r.plugin, "taskID", r.taskID, "status", status, "cmdExit", r.cmdExit, "cmdErr", r.cmdErr)
		}
		return nil, nil, nil
	} else {
		// bad plugin! status < 0. make it a failure
		slog.Error("plugin returned negative status", "plugin", r.plugin, "taskID", r.taskID, "status", status, "cmdExit", r.cmdExit, "cmdErr", r.cmdErr)
		stdout, merr := bson.MarshalExtJSON(task, false, false)
		if merr != nil {
			slog.Error("could not marshal plugin result", "err", merr)
		}
		result := bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin returned negative status (see stdout for status and any stdout or stderr it may have set)"}
		filter = bson.M{"_id": r.oid, "status": task["status"], "node": r.node, "mtime": r.doc["mtime"]} // filter for set status, need to query on status:task["status"]
		return result, filter, nil
	}
}

func (r *Runner) processCollectionResult() bson.M {
	var result bson.M
	opts := options.FindOneAndDelete().SetProjection(bson.M{"_id": 0, "status": 1, "stdout": 1, "stderr": 1})
	if err := r.db.Collection("results").FindOneAndDelete(context.Background(), bson.M{"_id": r.oid}, opts).Decode(&result); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			slog.Error("plugin did not create a document in 'results'", "plugin", r.plugin, "taskID", r.taskID, "cmdExit", r.cmdExit, "cmdErr", r.cmdErr)
			result = bson.M{"status": 2, "stderr": "plugin did not create a document in 'results'"}
		} else {
			slog.Error("unknown issue querying for result for task in 'results' collection", "taskID", r.taskID, "err", err, "cmdExit", r.cmdExit, "cmdErr", r.cmdErr)
			result = bson.M{"status": 2, "stderr": "unknown issue querying for result for task in 'results' collection: " + err.Error()}
		}
	}
	return r.validateStatus(result)
}

func (r *Runner) processFileResult(taskFile string, responseFile string) bson.M {
	var result bson.M
	if text, err := os.ReadFile(responseFile); err != nil {
		slog.Error("could not read task plugin response file", "plugin", r.plugin, "file", responseFile, "err", err, "cmdExit", r.cmdExit, "cmdErr", r.cmdErr)
		result = bson.M{"status": 2, "stderr": "could not read task plugin response file: " + err.Error()}
	} else if err = json.Unmarshal(text, &result); err != nil {
		slog.Error("plugin saved non-json in response file", "plugin", r.plugin, "file", responseFile, "cmdExit", r.cmdExit, "cmdErr", r.cmdErr)
		result = bson.M{"status": 2, "stdout": string(text), "stderr": "plugin saved non-json in response file (see stdout for any content it may have set)"}
	} else {
		// delete any noise in the json content
		for key := range result {
			if !slices.Contains([]string{"status", "stdout", "stderr"}, key) {
				delete(result, key)
			}
		}
	}
	// remove temp files
	if err := os.Remove(taskFile); err != nil && !errors.Is(err, os.ErrNotExist) {
		slog.Error("could not remove task file (continuing)", "file", taskFile, "err", err)
	}
	if err := os.Remove(responseFile); err != nil && !errors.Is(err, os.ErrNotExist) {
		slog.Error("could not remove response file (continuing)", "file", responseFile, "err", err)
	}
	return r.validateStatus(result)
}

func (r *Runner) validateStatus(result bson.M) bson.M {
	if status, err := normalizeStatus(result["status"]); err != nil {
		// err is UnknownStatusError, has `Status` of original result["status"], string value is "unknown type '%T' for status: %#v"
		message := "plugin returned unknown type for status"
		slog.Error(message, "plugin", r.plugin, "taskID", r.taskID, "status", result["status"], "type", fmt.Sprintf("%T", result["status"]), "cmdExit", r.cmdExit, "cmdErr", r.cmdErr)
		stdout, merr := bson.MarshalExtJSON(result, false, false)
		if merr != nil {
			slog.Error("could not marshal plugin result", "err", merr)
		}
		result = bson.M{"status": 2, "stdout": string(stdout), "stderr": message + " (see stdout for status and any stdout or stderr it may have set)"}
	} else if status < 1 {
		slog.Error("plugin returned non-positive status", "plugin", r.plugin, "taskID", r.taskID, "status", result["status"], "type", fmt.Sprintf("%T", result["status"]), "cmdExit", r.cmdExit, "cmdErr", r.cmdErr)
		stdout, merr := bson.MarshalExtJSON(result, false, false)
		if merr != nil {
			slog.Error("could not marshal plugin result", "err", merr)
		}
		result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin returned non-positive status (see stdout for status and any stdout or stderr it may have set)"}
	} else if status == 1 && r.cmdErr != nil {
		// bad for result status to be 1 but plugin exit code to be non-0, make it a failure
		slog.Error("plugin returned status:1 but did not exit cleanly", "plugin", r.plugin, "taskID", r.taskID, "cmdExit", r.cmdExit, "cmdErr", r.cmdErr)
		stdout, merr := bson.MarshalExtJSON(result, false, false)
		if merr != nil {
			slog.Error("could not marshal plugin result", "err", merr)
		}
		result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin returned status:1 but did not exit cleanly (see stdout for any stdout or stderr it may have set)"}
	} else {
		// good: status:1 with a clean exit, or status > 1
		result["status"] = status
		if r.cmdErr != nil {
			// log that even though the plugin set a proper failure status, it did not exit cleanly
			slog.Warn("plugin returned status>1 but did not exit cleanly", "plugin", r.plugin, "taskID", r.taskID, "status", status, "cmdExit", r.cmdExit, "cmdErr", r.cmdErr)
		}
	}
	return result
}

type Runner struct {
	db         *mongo.Database
	taskID     string
	oid        bson.ObjectID
	doc        bson.M
	node       string
	quiet      bool
	configFile string
	testing    bool
	config     Config
	cmdExit    int
	cmdErr     error
	plugin     string
	pluginType string
	isModule   bool
}

func (r *Runner) finish(result bson.M, filter bson.M) error {
	if filter == nil {
		filter = bson.M{"_id": r.oid, "status": 0, "node": r.node, "mtime": r.doc["mtime"]}
	}
	status := "failed"
	if result["status"] == 1 {
		status = "succeeded"
	}
	slog.Info(fmt.Sprintf("Task %s %s.", r.taskID, status))
	if !r.quiet {
		fmt.Fprintf(os.Stderr, "STDOUT: %v\n", result["stdout"])
		fmt.Fprintf(os.Stderr, "STDERR: %v\n", result["stderr"])
	}
	// set status first:
	update := bson.M{"$set": bson.M{"status": result["status"]}}
	if res, err := r.db.Collection("tasks").UpdateOne(context.Background(), filter, update); err != nil {
		return fmt.Errorf("unknown issue updating task %s with mtime %v to set status %s after completion: %w", r.taskID, r.doc["mtime"], result["status"], err)
	} else if res.MatchedCount == 0 {
		return fmt.Errorf("could not find task %s with mtime %v to set status %s after completion", r.taskID, r.doc["mtime"], result["status"])
	}

	// set rest of result:
	// GridFS: this prefers `stderr` as a string in the task document even when it's large, as on failures `stderr` is more likely needed to be parsed
	//         if `stderr` ends up in GridFS, so will `stdout` (unless it is empty)
	total := 0
	bucket := r.db.GridFSBucket(options.GridFSBucket().SetName("tasks"))
	for _, field := range []string{"stderr", "stdout"} {
		size := 0
		if s, ok := result[field].(string); ok {
			size = len(s)
		}
		total += size
		if size != 0 && total > 1024*1024*15 {
			uploadOpts := options.GridFSUpload().SetMetadata(bson.M{"task_id": r.oid})
			ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute) // allow 2 minutes for total upload: 16MB creates 65 chunks and 1 file document
			if id, err := bucket.UploadFromStream(ctx, field, strings.NewReader(result[field].(string)), uploadOpts); err != nil {
				slog.Error("unknown issue creating GridFS content for task field", "taskID", r.taskID, "field", field, "err", err)
				result[field] = nil
			} else {
				result[field] = id
			}
			cancel()
		}
	}

	filter = bson.M{"_id": r.oid, "status": result["status"], "node": r.node, "mtime": r.doc["mtime"]}
	update = bson.M{"$set": bson.M{"stdout": result["stdout"], "stderr": result["stderr"]}}
	if r.testing {
		update["complete"] = true
	}
	if res, err := r.db.Collection("tasks").UpdateOne(context.Background(), filter, update); err != nil {
		if r.testing {
			r.db.Collection("tasks").UpdateOne(context.Background(), filter, bson.M{"$set": bson.M{"complete": false}})
		}
		return fmt.Errorf("unknown issue updating task %s with mtime %v to set stdout/stderr after completion: %w", r.taskID, r.doc["mtime"], err)
	} else if res.MatchedCount == 0 {
		return fmt.Errorf("could not find task %s with mtime %v to update stdout/stderr after completion", r.taskID, r.doc["mtime"])
	}

	return nil
}

// `int32` becomes `int`, `int` unchanged, `float64` becomes `int` if it looks like one, otherwise returns error `UnknownStatusError`
func normalizeStatus(rstatus any) (int, error) {
	var status int
	var err error
	// result from mongo gives `int32`, result from json gives `float64`
	if s, ok := rstatus.(int32); ok {
		status = int(s)
	} else if status, ok = rstatus.(int); !ok {
		if s, ok := rstatus.(float64); !ok {
			err = &UnknownStatusError{Status: rstatus}
		} else if s == math.Trunc(s) && s > math.MinInt32 && s < math.MaxInt32 {
			// it looks like an integer, so make it a proper int
			status = int(s)
		} else {
			err = &UnknownStatusError{Status: rstatus}
		}
	}
	return status, err
}

type UnknownStatusError struct {
	Status any
}

func (e *UnknownStatusError) Error() string {
	return fmt.Sprintf("unknown type '%T' for status: %#v", e.Status, e.Status)
}

func mongodb(config Config) (*mongo.Database, error) {
	uri := config.MongoHost
	serverAPI := options.ServerAPI(options.ServerAPIVersion1) // set Stable API version to 1 (note: not necessary, but a good idea, requires MongoDB 5.0 or newer)
	// note: for Disbatch, if the server API changes, the Perl MongoDB module will break, as it's older than 5.0
	// note: SetMaxPoolSize(1) and SetServerMonitoringMode("poll") reduce the number of connections, useful when many very short tasks
	opts := options.Client().ApplyURI(uri).SetServerAPIOptions(serverAPI).SetMaxPoolSize(1).SetServerMonitoringMode("poll")
	opts.SetTimeout(30 * time.Second) // every operation will retry as needed for up to 30 seconds
	if len(config.Auth) > 0 {
		credential := options.Credential{
			AuthSource: config.Database,
			Username:   "task_runner",
			Password:   config.Auth["task_runner"],
		}
		opts.SetAuth(credential)
	}
	fmt.Fprintf(os.Stderr, "Connecting %v\n", time.Now().Format(time.ANSIC)) // warn
	client, err := mongo.Connect(opts)
	if err != nil {
		return nil, err
	}

	if err = client.Database("admin").RunCommand(context.Background(), bson.M{"ping": 1}).Err(); err != nil {
		return nil, err
	}

	return client.Database(config.Database), nil
}

type PluginArgs struct {
	Type     string `json:"type"` // "file", "collection", or "handoff"
	IsModule bool   `json:"-"`    // true when the config value was 1
}

// claude:
func (p *PluginArgs) UnmarshalJSON(data []byte) error {
	var n float64
	if err := json.Unmarshal(data, &n); err == nil {
		*p = PluginArgs{Type: "module", IsModule: true}
		return nil
	}

	type plain PluginArgs // a type declared this way has the same fields as `PluginArgs` but none of its methods, so it doesn't satisfy `Unmarshaler`
	var tmp plain
	if err := json.Unmarshal(data, &tmp); err != nil {
		return err
	}
	*p = PluginArgs(tmp)
	if p.Type == "" {
		p.Type = "file"
	}
	return nil
}

func (c *Config) UnmarshalJSON(data []byte) error {
	type plain Config
	var tmp plain
	if err := json.Unmarshal(data, &tmp); err != nil {
		return err
	}
	*c = Config(tmp)
	if c.TempDir == "" {
		c.TempDir = "/tmp/disbatch"
	}
	return nil
}

type Appender struct {
	Args   map[string]interface{} `json:"args"` // [filename:disbatchd.log], [color:map[WARN:cyan]]
	Layout string                 `json:"layout"`
	Type   string                 `json:"type"`
}

type Log4perl struct {
	Level     string              `json:"level"`
	Appenders map[string]Appender `json:"appenders"`
}

type Config struct {
	MongoHost    string                `json:"mongohost"`
	Database     string                `json:"database"`
	Auth         map[string]string     `json:"auth"`
	Log4perl     Log4perl              `json:"log4perl"`
	Plugins      map[string]PluginArgs `json:"plugins"` // value may be `1` or a map with key `type` and value: `file` `collection` `handoff`
	PluginRunner string                `json:"plugin_runner"`
	TempDir      string                `json:"temp_dir"`
}

func logger(config Config) error {
	filename := "/var/log/disbatchd.log"
	if fn, ok := config.Log4perl.Appenders["filelog"].Args["filename"].(string); ok {
		filename = fn
	}

	file, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}

	multi := io.MultiWriter(os.Stderr, file)

	levels := map[string]slog.Level{
		"TRACE": slog.Level(-8),
		"DEBUG": slog.LevelDebug,
		"INFO":  slog.LevelInfo,
		"WARN":  slog.LevelWarn,
		"ERROR": slog.LevelError,
		"FATAL": slog.Level(12),
	}
	level, ok := levels[config.Log4perl.Level]
	if !ok {
		level = slog.Level(-8)
	}
	log.SetOutput(multi)
	slog.SetLogLoggerLevel(level)
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)

	return nil
}

// return value is exit code, error. exit code is 0 and error is nil on success.
// exit code -3 means start failed, -2 means wait failed (not sure how), -1 means killed, + is whatever command exited with
func runCommand(command string, args []string) (int, error) {
	cmd := exec.Command(command, args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Start(); err != nil {
		return -3, err
	}
	slog.Info("started sub-process", "pid", cmd.Process.Pid)
	err := cmd.Wait()
	if err == nil {
		return 0, nil
	}
	var ee *exec.ExitError
	if errors.As(err, &ee) {
		// "signal: terminated", "exit status 255", etc
		return cmd.ProcessState.ExitCode(), err
	}
	slog.Error("something really bad happened", "err", err)
	return -2, err
}
