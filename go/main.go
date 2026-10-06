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
	taskID := flag.String("task", "", "The task's _id. Mandatory.")
	configFlag := flag.String("config", "", "Path to the JSON Disbatch config file. Mandatory.")
	quietFlag := flag.Bool("quiet", false, "Suppress STDOUT and STDERR output at end (mainly for testing).")
	testingFlag := flag.Bool("testing", false, "Passed to the Perl task runner with --handoff when running Perl plugins")
	flag.String("gfs", "", "NOOP: backcompat")
	flag.Parse()
	// flag.Args() is everything else, a slice, and can be passed an index for individual values
	if *configFlag == "" {
		slog.Error("config file must be passed with --config")
		return 1
	}

	var config Config
	if byteValue, err := os.ReadFile(*configFlag); err != nil {
		slog.Error("could not read config file", "err", err)
		return 1
	} else if err = json.Unmarshal(byteValue, &config); err != nil {
		slog.Error("could not parse config file", "file", *configFlag, "err", err)
		return 1
	}

	if err := logger(config); err != nil {
		slog.Error("could not set up logger", "err", err)
		return 1
	}

	if *taskID == "" {
		slog.Error("task ID must be passed with --task")
		return 1
	}

	node, err := os.Hostname()
	if err != nil {
		slog.Error("could not get hostname", "err", err)
		return 1
	}

	db, err := mongodb(config)
	if err != nil {
		slog.Error("could not connect to MongoDB", "err", err)
		return 1
	}
	defer func() {
		// we want to Disconnect() because idle sessions stay around for 30 minutes on the server
		// so no log.Fatal, os.Exit, etc after calling mongodb()!
		// below wrapped in `func() {...}()` as the args are otherwise evaluated immediately. fine with context.TODO/Background as it has no timeout but not with others.
		db.Client().Disconnect(context.Background())
	}()

	slog.Info(fmt.Sprintf("Starting task %s", *taskID))

	oid, err := bson.ObjectIDFromHex(*taskID)
	if err != nil {
		slog.Error("value for --task invalid", "taskID", *taskID, "err", err)
		return 1
	}

	// testing: delete and create if given the testing task id (to be removed once this is considered finished and proper tests are created)
	// FIXME: make this more configurable
	if *taskID == "65170b42b99efdd0b07d42de" {
		if _, err = db.Collection("tasks").DeleteOne(context.Background(), bson.M{"_id": oid}); err != nil {
			slog.Error("could not delete test task", "err", err)
			return 1
		}
		opts := options.UpdateOne().SetUpsert(true)
		if _, err = db.Collection("queues").UpdateOne(context.Background(), bson.M{"_id": oid}, bson.M{"$set": bson.M{"name": "go-test", "plugin": "/root/git/disbatch/t/task-nomongo.pl", "threads": 0}}, opts); err != nil {
			slog.Error("could not upsert test queue", "err", err)
			return 1
		}
		params := bson.M{"status": 1, "stdout": "hi", "stderr": "vague warning"}
		if _, err = db.Collection("tasks").InsertOne(context.Background(), bson.M{"_id": oid, "status": -1, "node": node, "mtime": time.Now(), "ctime": time.Now(), "queue": oid, "params": params}); err != nil {
			slog.Error("could not insert test task", "err", err)
			return 1
		}
	}

	filter := bson.M{"_id": oid, "status": -1, "node": node}
	update := bson.M{"$set": bson.M{"status": 0}}
	var doc bson.M
	if err = db.Collection("tasks").FindOneAndUpdate(context.Background(), filter, update).Decode(&doc); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			slog.Error("could not find task to set status 0", "taskID", *taskID)
		} else {
			slog.Error("unknown issue trying to find and update task to status 0", "taskID", *taskID, "err", err)
		}
		return 1
	}

	slog.Info(fmt.Sprintf("params for %s: %s", *taskID, doc["params"]))

	filter = bson.M{"_id": oid, "status": 0, "node": node, "mtime": doc["mtime"]}	// filter for set status, "handoff" may change it

	var queue bson.M
	var errmsg string
	var args Plugin
	var plugin string
	if err = db.Collection("queues").FindOne(context.Background(), bson.M{"_id": doc["queue"]}).Decode(&queue); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			errmsg = fmt.Sprintf("queue %v not found for task %v", doc["queue"], *taskID)
		} else {
			errmsg = fmt.Sprintf("unknown issue querying for queue %v for task %v: %v", doc["queue"], *taskID, err)
		}
	} else {
		var ok bool
		plugin, ok = queue["plugin"].(string)
		if !ok {
			errmsg = fmt.Sprintf("no plugin defined for task %v in queue %v", *taskID, doc["queue"])
		} else {
			args = config.Plugins[plugin]
			if args.IsModule {
				args.Type = "handoff"	// was "module", allows `go-task-runner` to run `bin/task_runner --handoff` for mixed plugin queues
				plugin = config.PluginRunner
			}
			// validate `plugin` and `args.Type`. we also validate `config.PluginRunner` value here as `plugin` when `args.IsModule` is true
			if !filepath.IsAbs(plugin) {
				errmsg = fmt.Sprintf("plugin value '%v' for task %v must be a full path", plugin, *taskID)
			} else if fileinfo, ferr := os.Stat(plugin); ferr != nil || !fileinfo.Mode().IsRegular() || fileinfo.Mode().Perm()&0111 == 0 {
				errmsg = fmt.Sprintf("%v not found or not executable for task %v", plugin, *taskID)
			} else if !slices.Contains([]string{"default", "nomongo", "mongo", "handoff"}, args.Type) {
				errmsg = fmt.Sprintf("%v has unknown type '%v' for task %v", plugin, args.Type, *taskID)
			}
		}
	}

	var cmdExit int
	var cmdErr error
	var result bson.M	// NOTE: should always have `status` (positive integer) and optional `stdout` and `stderr` (string, maybe nil)
	if errmsg != "" {
		slog.Error(errmsg)
		result = bson.M{ "status": 2, "stdout": "Unable to start", "stderr": errmsg }
	} else {
		// types: default nomongo mongo handoff
		// * nomongo: no mongo access, passes task and result via /tmp/*taskID.json
		//            uses local filesystem, don't have to worry about result size
		// * default: optional mongo access, passes task and result via /tmp/*taskID.json
		//            uses local filesystem, don't have to worry about result size
		// * mongo:   reads task from mongo via *taskID, saves result in "results" collection and this copies to "tasks" collection
		//            uses an additional collection creating extra load on mongo, have to worry about result size if it can exceed ~16MB, but no temp files
		// * handoff: reads task from mongo via *taskID, saves result in "tasks" collection and this exits
		//            writes result right where it belongs, have to worry about result size if it can exceed ~16MB, have to deal with all other finalizing
		var cargs []string
		if args.Type != "nomongo" {
			cf := *configFlag
			for _, ext := range []string{".json-strict", ".json-task_runner", ".json"} {
				if name, ok := strings.CutSuffix(*configFlag, ext); ok {
					cf = name + ".json-plugin"
					break
				}
			}
			cargs = append(cargs, "--config", cf)
		}
		if config.TempDir == "" {
			config.TempDir = "/tmp/disbatch"	// below will fail if this directory does not exist, but better than the root user creating in /
		}
		taskFile := filepath.Join(config.TempDir, *taskID+".json")
		responseFile := filepath.Join(config.TempDir, *taskID+"-response.json")
		if args.Type == "default" || args.Type == "nomongo" {
			var jsonTask []byte
			if jsonTask, err = json.Marshal(doc); err != nil {
				slog.Error("could not create json from task doc", "taskID", *taskID, "err", err)
				result = bson.M{"status": 2, "stderr": "could not create json from task doc: " + err.Error()}
				goto Ran
			}
			if err = os.Remove(taskFile); err != nil && !errors.Is(err, os.ErrNotExist) {	// this shouldn't exist, but in case it does
				slog.Error("could not remove old task file", "file", taskFile, "err", err)
				result = bson.M{"status": 2, "stderr": "could not remove old task file: " + err.Error()}
				goto Ran
			}
			if err = os.Remove(responseFile); err != nil && !errors.Is(err, os.ErrNotExist) {	// this shouldn't exist, but in case it does
				slog.Error("could not remove old response file", "file", responseFile, "err", err)
				result = bson.M{"status": 2, "stderr": "could not remove old reponse file: " + err.Error()}
				goto Ran
			}
			if err = os.WriteFile(taskFile, jsonTask, 0600); err != nil {
				slog.Error("could not create task file", "file", taskFile, "err", err)
				result = bson.M{"status": 2, "stderr": "could not create task file: " + err.Error()}
				goto Ran
			}
			cargs = append(cargs, "--task", taskFile)
		} else {
			cargs = append(cargs, "--task", *taskID)
			if args.Type == "handoff" {
				if *quietFlag {
					cargs = append(cargs, "--quiet")
				}
				if args.IsModule {
					cargs = append(cargs, "--handoff")
					if *testingFlag {
						cargs = append(cargs, "--testing")
					}
				}
			} else if args.Type == "mongo" {
				if _, err = db.Collection("results").DeleteOne(context.Background(), bson.M{"_id": oid}); err != nil {
					slog.Error("could not delete any pre-existing result for task in 'results' collection", "taskID", *taskID, "err", err)
					result = bson.M{"status": 2, "stderr": "could not delete any pre-existing result for task in 'results' collection: " + err.Error()}
					goto Ran
				}
			}
		}

		cmdExit, cmdErr = runCommand(plugin, cargs)	// 0 on success, err != nil on failure
		if cmdErr != nil {
			// if cmdExit < 0, then result likely not saved
			// * cmdExit -3 means start failed, -2 means wait failed (not sure how), -1 means killed
			// if cmdExit > 0, then perhaps saved perhaps not (a task should not exit non-zero when the task fails–it should set status to 2)
			slog.Error("plugin did not exit cleanly", "plugin", plugin, "taskID", *taskID, "cmdExit", cmdExit, "cmdErr", cmdErr)
		} else {
			// cmdExit is 0, no error
			slog.Info("plugin exited cleanly", "plugin", plugin, "taskID", *taskID)
		}
		// put `cmdExit` and `cmdErr` into the task doc
		var res *mongo.UpdateResult
		if res, err = db.Collection("tasks").UpdateOne(context.Background(), bson.M{"_id": oid, "node": node, "mtime": doc["mtime"]}, bson.M{"$set": bson.M{"cmdExit": cmdExit, "cmdErr": fmt.Sprintf("%v",cmdErr)}}); err != nil {
			slog.Error("unknown issue updating task to set 'exit' and 'error'", "taskID", *taskID, "mtime", doc["mtime"], "err", err)
		} else if res.MatchedCount == 0 {
			slog.Error("could not find task to set 'exit' and 'error'", "taskID", *taskID, "mtime", doc["mtime"])
		}

		if args.Type == "handoff" {
			var task bson.M
			opts := options.FindOne().SetProjection(bson.M{"_id": 0, "status": 1, "stdout": 1, "stderr": 1})
			if err = db.Collection("tasks").FindOne(context.Background(), bson.M{"_id": oid, "node": node, "mtime": doc["mtime"]}, opts).Decode(&task); err != nil {
				if errors.Is(err, mongo.ErrNoDocuments) {
					slog.Error("could not find handoff task to validate status", "taskID", *taskID, "mtime", doc["mtime"], "cmdExit", cmdExit, "cmdErr", cmdErr)
				} else {
					slog.Error("unknown issue querying for handoff task to validate status", "taskID", *taskID, "mtime", doc["mtime"], "err", err, "cmdExit", cmdExit, "cmdErr", cmdErr)
				}
				return 1
			}
			// `status` from mongo is type `int32`
			if status, ok := task["status"].(int32); !ok {
				// bad plugin! status not int32. make it a failure
				slog.Error("plugin returned unknown type for status", "plugin", plugin, "taskID", *taskID, "status", task["status"], "type", fmt.Sprintf("%T", task["status"]), "cmdExit", cmdExit, "cmdErr", cmdErr)
				stdout, merr := bson.MarshalExtJSON(task, false, false)
				if merr != nil {
					slog.Error("could not marshal plugin result", "err", merr)
				}
				result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin returned unknown type for status (see stdout for status and any stdout or stderr it may have set)"}
			} else if status == 0 {
				// plugin didn't finish. make it a failure
				slog.Error("plugin did not update status", "plugin", plugin, "taskID", *taskID, "cmdExit", cmdExit, "cmdErr", cmdErr)
				stdout, merr := bson.MarshalExtJSON(task, false, false)
				if merr != nil {
					slog.Error("could not marshal plugin result", "err", merr)
				}
				result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin did not update status (see stdout for any stdout or stderr it may have set)"}
			} else if status == int32(1) {
				if cmdErr == nil {
					return 0
				}
				// bad plugin! status == 1 but plugin exit code non-0. make it a failure
				slog.Error("plugin returned status:1 but did not exit cleanly", "plugin", plugin, "taskID", *taskID, "cmdExit", cmdExit, "cmdErr", cmdErr)
				stdout, merr := bson.MarshalExtJSON(task, false, false)
				if merr != nil {
					slog.Error("could not marshal plugin result", "err", merr)
				}
				result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin returned status:1 but did not exit cleanly (see stdout for any stdout or stderr it may have set)"}
				filter = bson.M{"_id": oid, "status": 1, "node": node, "mtime": doc["mtime"]}	// filter for set status, need to query on status:1
			} else if status > int32(1) {
				// good: task failed.
				if cmdErr != nil {
					// log that even though the handoff plugin set a proper failure status, it did not exit cleanly
					slog.Warn("plugin returned status>1 but did not exit cleanly", "plugin", plugin, "taskID", *taskID, "status", status, "cmdExit", cmdExit, "cmdErr", cmdErr)
				}
				return 0
			} else {
				// bad plugin! status < 0. make it a failure
				slog.Error("plugin returned negative status", "plugin", plugin, "taskID", *taskID, "status", status, "cmdExit", cmdExit, "cmdErr", cmdErr)
				stdout, merr := bson.MarshalExtJSON(task, false, false)
				if merr != nil {
					slog.Error("could not marshal plugin result", "err", merr)
				}
				result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin returned negative status (see stdout for status and any stdout or stderr it may have set)"}
			}
		} else if args.Type == "mongo" {
			opts := options.FindOneAndDelete().SetProjection(bson.M{"_id": 0, "status": 1, "stdout": 1, "stderr": 1})
			if err = db.Collection("results").FindOneAndDelete(context.Background(), bson.M{"_id": oid}, opts).Decode(&result); err != nil {
				if errors.Is(err, mongo.ErrNoDocuments) {
					slog.Error("plugin did not create a document in 'results'", "plugin", plugin, "taskID", *taskID, "cmdExit", cmdExit, "cmdErr", cmdErr)
					result = bson.M{"status": 2, "stderr": "plugin did not create a document in 'results'"}
				} else {
					slog.Error("unknown issue querying for result for task in 'results' collection", "taskID", *taskID, "err", err, "cmdExit", cmdExit, "cmdErr", cmdErr)
					result = bson.M{"status": 2, "stderr": "unknown issue querying for result for task in 'results' collection: " + err.Error() }
				}
			}
		} else {	// args.Type == "default" || args.Type == "nomongo"
			var text []byte
			if text, err = os.ReadFile(responseFile); err != nil {
				slog.Error("could not read task plugin response file", "plugin", plugin, "file", responseFile, "err", err, "cmdExit", cmdExit, "cmdErr", cmdErr)
				result = bson.M{"status": 2, "stderr": "could not read task plugin response file: "+err.Error()}
			} else {
				if err = json.Unmarshal(text, &result); err != nil {
					slog.Error("plugin saved non-json in response file", "plugin", plugin, "file", responseFile, "cmdExit", cmdExit, "cmdErr", cmdErr)
					result = bson.M{"status": 2, "stdout": string(text), "stderr": "plugin saved non-json in response file (see stdout for any content it may have set)"}
				} else {
					// delete any noise in the json content
					for key := range result {
						if !slices.Contains([]string{"status", "stdout", "stderr"}, key) {
							delete(result, key)
						}
					}
				}
			}
			// remove temp files
			if err = os.Remove(taskFile); err != nil && !errors.Is(err, os.ErrNotExist) {
				slog.Error("could not remove task file (continuing)", "file", taskFile, "err", err)
			}
			if err = os.Remove(responseFile); err != nil && !errors.Is(err, os.ErrNotExist) {
				slog.Error("could not remove response file (continuing)", "file", responseFile, "err", err)
			}
		}

		if args.Type != "handoff" {
			var status int
			if status, err = normalizeStatus(result["status"]); err != nil {
				// err is UnknownStatusError, has `Status` of original result["status"], string value is "unknown type '%T' for status: %#v"
				message := "plugin returned unknown type for status"
				slog.Error(message, "plugin", plugin, "taskID", *taskID, "status", result["status"], "type", fmt.Sprintf("%T", result["status"]), "cmdExit", cmdExit, "cmdErr", cmdErr)
				stdout, merr := bson.MarshalExtJSON(result, false, false)
				if merr != nil {
					slog.Error("could not marshal plugin result", "err", merr)
				}
				result = bson.M{"status": 2, "stdout": string(stdout), "stderr": message + " (see stdout for status and any stdout or stderr it may have set)"}
			} else if status < 1 {
				slog.Error("plugin returned non-positive status", "plugin", plugin, "taskID", *taskID, "status", result["status"], "type", fmt.Sprintf("%T", result["status"]), "cmdExit", cmdExit, "cmdErr", cmdErr)
				stdout, merr := bson.MarshalExtJSON(result, false, false)
				if merr != nil {
					slog.Error("could not marshal plugin result", "err", merr)
				}
				result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin returned non-positive status (see stdout for status and any stdout or stderr it may have set)"}
			} else if status == 1 && cmdErr != nil {
				// bad for result status to be 1 but plugin exit code to be non-0, make it a failure
				slog.Error("plugin returned status:1 but did not exit cleanly", "plugin", plugin, "taskID", *taskID, "cmdExit", cmdExit, "cmdErr", cmdErr)
				stdout, merr := bson.MarshalExtJSON(result, false, false)
				if merr != nil {
					slog.Error("could not marshal plugin result", "err", merr)
				}
				result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin returned status:1 but did not exit cleanly (see stdout for any stdout or stderr it may have set)"}
			} else {
				// good: task failed. status > 1
				result["status"] = status
				if cmdErr != nil {
					// log that even though the plugin set a proper failure status, it did not exit cleanly
					slog.Warn("plugin returned status>1 but did not exit cleanly", "plugin", plugin, "taskID", *taskID, "status", status, "cmdExit", cmdExit, "cmdErr", cmdErr)
				}
			}
		}
	}
Ran:

	status := "failed"
	if result["status"] == 1 {
		status = "succeeded"
	}
	slog.Info(fmt.Sprintf("Task %s %s.", *taskID, status))
	if !*quietFlag {
		fmt.Fprintf(os.Stderr, "STDOUT: %v\n", result["stdout"])
		fmt.Fprintf(os.Stderr, "STDERR: %v\n", result["stderr"])
	}
	// set status first:
	update = bson.M{"$set": bson.M{"status": result["status"]}}
	var res *mongo.UpdateResult
	if res, err = db.Collection("tasks").UpdateOne(context.Background(), filter, update); err != nil {
		slog.Error("unknown issue updating task to set status after completion", "taskID", *taskID, "mtime", doc["mtime"], "status", result["status"], "err", err)
		return 1
	} else if res.MatchedCount == 0 {
		slog.Error("could not find task to set status after completion", "taskID", *taskID, "mtime", doc["mtime"], "status", result["status"])
		return 1
	}

	// set rest of result:
	// GridFS: this prefers `stderr` as a string in the task document even when it's large, as on failures `stderr` is more likely needed to be parsed
	//         if `stderr` ends up in GridFS, so will `stdout` (unless it is empty)
	total := 0
	bucket := db.GridFSBucket(options.GridFSBucket().SetName("tasks"))
	for _, field := range []string{"stderr", "stdout"} {
		size := 0
		if s, ok := result[field].(string); ok {
			size = len(s)
		}
		total += size
		if size != 0 && total > 1024*1024*15 {
			uploadOpts := options.GridFSUpload().SetMetadata(bson.M{"task_id": oid})
			ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)	// allow 2 minutes for total upload: 16MB creates 65 chunks and 1 file document
			var id bson.ObjectID
			if id, err = bucket.UploadFromStream(ctx, field, strings.NewReader(result[field].(string)), uploadOpts); err != nil {
				slog.Error("unknown issue creating GridFS content for task field", "taskID", *taskID, "field", field, "err", err)
				result[field] = nil
			} else {
				result[field] = id
			}
			cancel()
		}
	}

	filter = bson.M{"_id": oid, "status": result["status"], "node": node, "mtime": doc["mtime"]}
	update = bson.M{"$set": bson.M{"stdout": result["stdout"], "stderr": result["stderr"], "complete": true}}
	if res, err = db.Collection("tasks").UpdateOne(context.Background(), filter, update); err != nil {
		db.Collection("tasks").UpdateOne(context.Background(), filter, bson.M{"$set":bson.M{"complete": false}})
		slog.Error("unknown issue updating task to set stdout/stderr after completion", "taskID", *taskID, "mtime", doc["mtime"], "err", err)
		return 1
	} else if res.MatchedCount == 0 {
		slog.Error("could not find task to update stdout/stderr after completion", "taskID", *taskID, "mtime", doc["mtime"])
		return 1
	}

	return 0
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
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)	// set Stable API version to 1 (note: not necessary, but a good idea, requires MongoDB 5.0 or newer)
	// note: for Disbatch, if the server API changes, the Perl MongoDB module will break, as it's older than 5.0
	// note: SetMaxPoolSize(1) and SetServerMonitoringMode("poll") reduce the number of connections, useful when many very short tasks
	opts := options.Client().ApplyURI(uri).SetServerAPIOptions(serverAPI).SetMaxPoolSize(1).SetServerMonitoringMode("poll")
	opts.SetTimeout(30 * time.Second)	// every operation will retry as needed for up to 30 seconds
	if len(config.Auth) > 0 {
		credential := options.Credential{
			AuthMechanism: "PLAIN",
			AuthSource:    config.Database,
			Username:      "task_runner",
			Password:      config.Auth["task_runner"],
		}
		opts.SetAuth(credential)
	}
	fmt.Fprintf(os.Stderr, "Connecting %v\n", time.Now().Format(time.ANSIC))	// warn
	client, err := mongo.Connect(opts)
	if err != nil {
		return nil, err
	}

	if err = client.Database("admin").RunCommand(context.Background(), bson.M{"ping": 1}).Err(); err != nil {
		return nil, err
	}

	return client.Database(config.Database), nil
}


type Plugin struct {
	Type     string `json:"type"` // "default", "handoff", "mongo" or "nomongo"
	IsModule bool   `json:"-"`    // true when the config value was 1
}

// claude:
func (p *Plugin) UnmarshalJSON(data []byte) error {
	var n float64
	if err := json.Unmarshal(data, &n); err == nil {
		*p = Plugin{Type: "module", IsModule: true}
		return nil
	}

	type plain Plugin	// a type declared this way has the same fields as `Plugin` but none of its methods, so it doesn't satisfy `Unmarshaler`
	var tmp plain
	if err := json.Unmarshal(data, &tmp); err != nil {
		return err
	}
	*p = Plugin(tmp)
	if p.Type == "" {
		p.Type = "default"
	}
	return nil
}

type Appender struct {
	Args       map[string]interface{} `json:"args"`		// [filename:disbatchd.log], [color:map[WARN:cyan]]
	Layout     string                 `json:"layout"`
	Type       string                 `json:"type"`
}

type Log4perl struct {
	Level      string                 `json:"level"`
	Appenders  map[string]Appender    `json:"appenders"`
}

type Config struct {
	MongoHost  string                 `json:"mongohost"`
	Database   string                 `json:"database"`
	Auth       map[string]string      `json:"auth"`
	Log4perl   Log4perl               `json:"log4perl"`
	Plugins    map[string]Plugin      `json:"plugins"`	// value may be `1` or a map with key `type` and value: `default` `handoff` `mongo` `nomongo`
	PluginRunner string               `json:"plugin_runner"`
	TempDir	   string                 `json:"temp_dir"`
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
		"TRACE":  slog.Level(-8),
		"DEBUG":  slog.LevelDebug,
		"INFO":   slog.LevelInfo,
		"WARN":   slog.LevelWarn,
		"ERROR":  slog.LevelError,
		"FATAL":  slog.Level(12),
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
