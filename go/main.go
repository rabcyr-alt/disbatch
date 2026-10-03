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
	"regexp"
	"slices"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var testingFlag *bool

func main() {
	os.Exit(run())
}

func run() int {
	taskID := flag.String("task", "", "The task's _id. Mandatory.")
	configFlag := flag.String("config", "", "Path to the JSON Disbatch config file. Mandatory.")
	quietFlag := flag.Bool("quiet", false, "Suppress STDOUT and STDERR output at end (mainly for testing).")
	testingFlag = flag.Bool("testing", false, "Passed to the Perl task runner with --handoff when running Perl plugins, defaults logfile to \"disbatchd.log\"")
	gfsFlag := flag.String("gfs", "", "NOOP: backcompat")
	flag.Parse()
	// flag.Args() is everything else, a slice, and can be passed an index for individual values
	if *gfsFlag != "" {
		// NOOP: might be passed but does not apply here
	}
	err := logger(Config{})
	if err != nil {
		slog.Error(err.Error())
		return 1
	}
	if *configFlag == "" {
		slog.Error("config file must be passed with --config option")
		return 1
	}

	byteValue, err := os.ReadFile(*configFlag)
	if err != nil {
		slog.Error(err.Error())
		return 1
	}
	var config Config
	err = json.Unmarshal(byteValue, &config)
	if err != nil {
		slog.Error(err.Error())
		return 1
	}

	err = logger(config)
	if err != nil {
		slog.Error(err.Error())
		return 1
	}

	if *taskID == "" {
		slog.Error("no --task")
		return 1
	}

	node, err := os.Hostname()
	if err != nil {
		slog.Error(err.Error())
		return 1
	}

	db, err := mongodb(config)
	if err != nil {
		slog.Error(err.Error())
		return 1
	}
	defer func() {
		// we want to Disconnect() because idle sessions stay around for 30 minutes on the server
		// so no log.Fatal, os.Exit, etc after calling mongodb()!
		// below wrapped in `func() {...}()` as the args are otherwise evaluated immediately. fine with context.TODO() as it has no timeout but not with others.
		db.Client().Disconnect(context.TODO())
	}()

	slog.Info("Starting task " + *taskID)

	oid, err := bson.ObjectIDFromHex(*taskID)
	if err != nil {
		slog.Error("value for --task invalid", "taskID", *taskID, "error", err)
		return 1
	}

	// testing: delete and create if given the testing task id
	if *taskID == "65170b42b99efdd0b07d42de" {
		_, err = db.Collection("tasks").DeleteOne(context.TODO(), bson.M{"_id": oid})
		if err != nil {
			slog.Error(err.Error())
			return 1
		}

		opts := options.UpdateOne().SetUpsert(true)
		_, err = db.Collection("queues").UpdateOne(context.TODO(), bson.M{"_id": oid}, bson.M{"$set": bson.M{"name": "go-test", "plugin": "/root/git/disbatch/t/task-nomongo", "threads": 0}}, opts)
		if err != nil {
			slog.Error(err.Error())
			return 1
		}

		params := bson.M{"status": 1, "stdout": "hi", "stderr": "vague warning"}
		_, err = db.Collection("tasks").InsertOne(context.TODO(), bson.M{"_id": oid, "status": -1, "node": node, "mtime": time.Now(), "ctime": time.Now(), "queue": oid, "params": params})
		if err != nil {
			slog.Error(err.Error())
			return 1
		}
	}

	filter := bson.M{"_id": oid, "status": -1, "node": node}		// bson.D{{"_id", oid}}
	update := bson.M{"$set": bson.M{"status": 0}}
	var doc bson.M
	err = db.Collection("tasks").FindOneAndUpdate(context.TODO(), filter, update).Decode(&doc)	// FIXME: in perl, wrapped in `retry/catch` (try 10 times with exponential backoff, with a random delay up to 100 milliseconds)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			slog.Error("could not find task " + *taskID + " on node "+node+" to set status 0")
			return 1
		} else {
			slog.Error("could not find and set task " + *taskID + " to status 0", "error", err)
			return 1
		}
	}

	log.Printf("params for %s: %s", *taskID, doc["params"])

	filter = bson.M{"_id": oid, "status": 0, "node": node, "mtime": doc["mtime"]}	// filter for set status, "handoff" may change it

	var queue bson.M
	err = db.Collection("queues").FindOne(context.TODO(), bson.M{"_id": doc["queue"]}).Decode(&queue)
	// NOTE: `queue` may be `{}`
	plugin := queue["plugin"]	// NOTE: may be `nil`
//plugin = "/root/git/disbatch/t/task-nomongo.pl"

	var errmsg string
	var args Plugin
	if plugin == nil {
		errmsg = fmt.Sprintf("no plugin defined for task %v in queue %v", *taskID, doc["queue"])
	} else {
		args = config.Plugins[plugin.(string)]
		if args.IsModule {
			args.Type = "handoff"	// was "module"
			plugin = config.PluginRunner
		}
		// validate `plugin` and `args.Type`. we also validate `config.PluginRunner` here when `args.IsModule`
		fileinfo, err := os.Stat(plugin.(string))
		if matched, _ := regexp.Match(`^/`,[]byte(plugin.(string))); !matched {
			errmsg = fmt.Sprintf("plugin value '%v' for task %v must be a full path", plugin, *taskID)
		} else if err != nil || !fileinfo.Mode().IsRegular() || fileinfo.Mode().Perm()&0111 == 0 {
			errmsg = fmt.Sprintf("%v not found or not executable for task %v", plugin, *taskID)
		} else if !slices.Contains([]string{"default", "nomongo", "mongo", "handoff"}, args.Type) {
			errmsg = fmt.Sprintf("%v has unknown type '%v' for task %v", plugin, args.Type, *taskID)
		}
	}

	var exit int
	var cerr error
	var result bson.M						// NOTE: should always have `status` (positive integer) and optional `stdout` and `stderr` (string, maybe nil)
	if errmsg != "" {
		slog.Error(errmsg)
		result = bson.M{ "status": 2, "stdout": "Unable to start", "stderr": errmsg }
	} else {
//		try {
			// NOTE (perl): nothing in this block should die *deliberately*, and if execution should stop on an error use `exit 1`. the try block at the end is in case something does slip through.
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
			re := regexp.MustCompile(`\.json(-(strict|task_runner))?$`)
			cf := re.ReplaceAllString(*configFlag, ".json-plugin")
			if args.Type != "nomongo" {
				cargs = append(cargs, "--config", cf)
			}
			if args.Type == "default" || args.Type == "nomongo" {
				json_task, err := json.Marshal(doc)
				if err != nil {
					slog.Error("could not create json from task doc for "+*taskID, "error", err)
					result = bson.M{"status": 2, "stderr": "could not create json from task doc: " + err.Error()}
					goto Ran
				}
				err = os.Remove("/tmp/"+*taskID+".json")	// these shouldn't exist, but in case they do
				if err != nil && !errors.Is(err, os.ErrNotExist) {
					slog.Error("could not remove old task file /tmp/"+*taskID+".json", "error", err)
					result = bson.M{"status": 2, "stderr": "could not remove old task file: " + err.Error()}
					goto Ran
				}
				err = os.Remove("/tmp/"+*taskID+"-response.json")	// these shouldn't exist, but in case they do
				if err != nil && !errors.Is(err, os.ErrNotExist) {
					slog.Error("could not remove old reponse file /tmp/"+*taskID+"-response.json", "error", err)
					result = bson.M{"status": 2, "stderr": "could not remove old reponse file: " + err.Error()}
					goto Ran
				}
				err = os.WriteFile("/tmp/"+*taskID+".json", []byte(json_task), 0600)
				if err != nil {
					slog.Error("could not create task file /tmp/"+*taskID+".json", "error", err)
					result = bson.M{"status": 2, "stderr": "could not create task file: " + err.Error()}
					goto Ran
				}
				cargs = append(cargs, "--task", "/tmp/"+*taskID+".json")
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
					_, err := db.Collection("results").DeleteOne(context.TODO(), bson.M{"_id": oid})	// FIXME: in perl, wrapped in `retry/catch`
					if err != nil {
						slog.Error("could not delete any pre-existing result for task "+*taskID+" in 'results' collection", "error", err)
						result = bson.M{"status": 2, "stderr": "could not delete any pre-existing result for task in 'results' collection: " + err.Error()}
						goto Ran
					}
				}
			}

			exit, cerr = runCommand(plugin.(string), cargs)	// 0 on success, err != nil on failure
			if cerr != nil {
				// if exit < 0, then result likely not saved
				// * exit -3 means start failed, -2 means wait failed (not sure how), -1 means killed
				// if exit > 0, then perhaps saved perhaps not (a task should not exit non-zero when the task fails–it should set status to 2)
				slog.Error(args.Type+" plugin '"+plugin.(string)+"' for task "+*taskID+" did not exit cleanly", "exit", exit, "error", cerr)

			} else {
				// exit is 0, no error
				slog.Info(args.Type+" plugin '"+plugin.(string)+"' for task "+*taskID+" exited cleanly")
			}
			// put `exit` and `cerr` into the task doc
			res, err := db.Collection("tasks").UpdateOne(context.TODO(), bson.M{"_id": oid, "node": node, "mtime": doc["mtime"]}, bson.M{"$set": bson.M{"exit": exit, "error": fmt.Sprintf("%#v",cerr)}})	// FIXME: in perl, wrapped in `retry/catch`
			if err != nil {
				slog.Error("unknown issue updating "+args.Type+" task "+*taskID+" to set 'exit' and 'error' after non-clean exit", "error", err)
			} else if res.MatchedCount == 0 {
				slog.Error("task "+*taskID+" not found with node "+node+" and mtime "+fmt.Sprintf("%v",doc["mtime"])+" to set 'exit' and 'error' after non-clean exit")
			}

			if args.Type == "handoff" {
				var task bson.M
				err := db.Collection("tasks").FindOne(context.TODO(), bson.M{"_id": oid, "node": node, "mtime": doc["mtime"]}).Decode(&task)	// FIXME: in perl, wrapped in `retry/catch`
				if err != nil {
					if errors.Is(err, mongo.ErrNoDocuments) {
						slog.Error("task "+*taskID+" not found with node "+node+" and mtime "+fmt.Sprintf("%v",doc["mtime"]), "exit", exit, "error", cerr)
					} else {
						slog.Error("unknown issue querying for handoff task "+*taskID+" to validate status", "err", err, "exit", exit, "error", cerr)
					}
					return 1
				}
				// `task` has current `node` and `mtime`; `status` from mongo is type `int32`
				if status, ok := task["status"].(int32); !ok {
					// bad plugin! status not int32. make it a failure
					slog.Error(args.Type+" plugin '"+plugin.(string)+"' for task "+*taskID+" returned unknown type '"+ fmt.Sprintf("%T",task["status"]) +"' for status", "status", task["status"], "exit", exit, "error", cerr)
					var rs = bson.M{"status": fmt.Sprintf("%#v", task["status"]), "stdout": task["stdout"], "stderr": task["stderr"]}
					stdout,_ := json.Marshal(rs)
					result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin returned unknown type for status (see stdout for status and any stdout or stderr it may have set)"}
				} else if status == 0 {
					// plugin didn't finish. make it a failure
					slog.Error(args.Type+" plugin '"+plugin.(string)+"' for task "+*taskID+" did not update status", "exit", exit, "error", cerr)
					var rs = bson.M{"stdout": task["stdout"], "stderr": task["stderr"]}
					stdout,_ := json.Marshal(rs)
					result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin did not update status (see stdout for any stdout or stderr it may have set)"}
				} else if status == int32(1) {
					if cerr == nil {
						return 0
					}
					// bad plugin! status == 1 but plugin exit code non-0. make it a failure
					slog.Error(args.Type+" plugin '"+plugin.(string)+"' for task "+*taskID+" returned status:1 but did not exit cleanly", "exit", exit, "error", cerr)
					var rs = bson.M{"stdout": task["stdout"], "stderr": task["stderr"]}
					stdout,_ := json.Marshal(rs)
					result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin returned status:1 but did not exit cleanly (see stdout for any stdout or stderr it may have set)"}
					filter = bson.M{"_id": oid, "status": 1, "node": node, "mtime": doc["mtime"]}	// filter for set status, need to query on status:1
					// NOTE: we set `result`: do not return!
				} else if status > int32(1) {
					// good: task failed.
					if cerr == nil {
						return 0
					}
					// log that even though the handoff plugin set a proper failure status, it did not exit cleanly (and then also don't exist cleanly)
					slog.Error(args.Type+" plugin '"+plugin.(string)+"' for task "+*taskID+" returned status>1 but did not exit cleanly", "status", status, "exit", exit, "error", cerr)
					return 1
				} else {
					// bad plugin! status < 0. make it a failure
					slog.Error(args.Type+" plugin '"+plugin.(string)+"' for task "+*taskID+" has negative status", "status", status, "exit", exit, "error", cerr)
					var rs = bson.M{"status": status, "stdout": task["stdout"], "stderr": task["stderr"]}
					stdout,_ := json.Marshal(rs)
					result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin has negative status (see stdout for status and any stdout or stderr it may have set)"}
				}
			} else if args.Type == "mongo" {
				err = db.Collection("results").FindOneAndDelete(context.TODO(), bson.M{"_id": oid}).Decode(&result)	// FIXME: in perl, wrapped in `retry/catch` (try 10 times with exponential backoff, with a random delay up to 100 milliseconds)
				if err != nil {
					if err == mongo.ErrNoDocuments {
						slog.Error(args.Type+" plugin '"+plugin.(string)+"' for task "+*taskID+" did not create a document in 'results'", "exit", exit, "error", cerr)
						result = bson.M{"status": 2, "stderr": "plugin did not create a document in 'results' for task"}
					} else {
						slog.Error("could not get result for "+*taskID+" in 'results' collection", "err", err, "exit", exit, "error", cerr)
						result = bson.M{"status": 2, "stderr": "could not get result for task in 'results' collection: " + err.Error() }
					}
				}
			} else {	// args.Type == "default" || args.Type == "nomongo"
				text, err := os.ReadFile("/tmp/"+*taskID+"-response.json")
				if err != nil {
					// cannot read file
					slog.Error("could not read task plugin '"+plugin.(string)+"' response file /tmp/"+*taskID+"-response.json", "err", err, "exit", exit, "error", cerr)
					result = bson.M{"status": 2, "stderr": "could not read task plugin response file: "+err.Error()}
				} else {
					err = json.Unmarshal(text, &result)
					if err != nil {
						// cannot parse json
						slog.Error(args.Type+" plugin '"+plugin.(string)+"' for task "+*taskID+" saved non-json in response file /tmp/"+*taskID+"-response.json", "exit", exit, "error", cerr)
						result = bson.M{"status": 2, "stdout": text, "stderr": "plugin saved non-json in response file (see stdout for any content it may have set)"}
					}
				}
				// remove temp files
				os.Remove("/tmp/"+*taskID+".json")
				if err != nil && !errors.Is(err, os.ErrNotExist) {
					// don't need to fail the task, but wtf
					slog.Error("could not remove file /tmp/"+*taskID+".json (continuing)", "error", err)
				}
				os.Remove("/tmp/"+*taskID+"-response.json")
				if err != nil && !errors.Is(err, os.ErrNotExist) {
					// don't need to fail the task, but wtf
					slog.Error("could not remove file /tmp/"+*taskID+"-response.json (continuing)", "error", err)
				}
			}

			if args.Type != "handoff" {
				result["status"], err = mungeStatus(result["status"])	// result["status"] now `int`
				if err != nil {
					// result["status"] now nil, i think
					// err may be UnknownStatusError or NonIntegerStatusError, has `Status` of original result["status"]
					// string value is "unknown type '%T' for status: %#v" or "non-integer '%T' for status: %#v"
					slog.Error(args.Type+" plugin '"+plugin.(string)+"' for task "+*taskID+" returned " + err.Error(), "exit", exit, "error", cerr)
					var rs = bson.M{"status": result["status"], "stdout": result["stdout"], "stderr": result["stderr"]}
					stdout,_ := json.Marshal(rs)
					stderr := "plugin returned unknown type for status (see stdout for status and any stdout or stderr it may have set)"
					var niserr *NonIntegerStatusError
					if errors.As(err, &niserr) {
						stderr = "plugin returned non-integer for status (see stdout for status and any stdout or stderr it may have set)"
					}
					result = bson.M{"status": 2, "stdout": string(stdout), "stderr": stderr}
				} else if result["status"].(int) < 1 {
					slog.Error(args.Type+" plugin '"+plugin.(string)+"' for task "+*taskID+" returned other than a positive integer for status", "status", result["status"], "exit", exit, "error", cerr)
					var rs = bson.M{"status": result["status"], "stdout": result["stdout"], "stderr": result["stderr"]}
					stdout,_ := json.Marshal(rs)
					result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin returned other than a positive integer for status (see stdout for status and any stdout or stderr it may have set)"}
				} else if result["status"] == 1 && cerr != nil {
					// bad for result status to be 1 but plugin exit code to be non-0, make it a failure
					slog.Error(args.Type+" plugin '"+plugin.(string)+"' for task "+*taskID+" returned status:1 but did not exit cleanly", "exit", exit, "error", cerr)
					var rs = bson.M{"stdout": result["stdout"], "stderr": result["stderr"]}
					stdout,_ := json.Marshal(rs)
					result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "plugin returned status:1 but did not exit cleanly (see stdout for any stdout or stderr it may have set)"}
				}
			}

//		} catch {
//			slog.Error("Thread has uncaught exception: $_");
//			$result = {status => 2, stdout => "Unable to complete", stderr => "Thread has uncaught exception: $_"};
//		};

	}
Ran:

	status := "failed"
	if result["status"] == 1 {
		status = "succeeded"
	}
	slog.Info("Task "+*taskID+" " + status+".")
	if !*quietFlag {
		fmt.Fprintf(os.Stderr, "STDOUT: %s\n", getStringOrNull(result, "stdout"))
		fmt.Fprintf(os.Stderr, "STDERR: %s\n", getStringOrNull(result, "stderr"))
	}
	// set status first:
	update = bson.M{"$set": bson.M{"status": result["status"]}}
	res, err := db.Collection("tasks").UpdateOne(context.TODO(), filter, update)	// FIXME: in perl, wrapped in `retry/catch` (try 10 times with exponential backoff, with a random delay up to 100 milliseconds)
	if err != nil {
		slog.Error("could not update task " + *taskID + " status to "+strconv.Itoa(result["status"].(int))+" after completion", "error", err)
		return 1
	} else if res.MatchedCount == 0 {
		slog.Error("task "+*taskID+" not found with node "+node+" and mtime "+fmt.Sprintf("%v",doc["mtime"])+" to set status to "+strconv.Itoa(result["status"].(int))+" after completion")
		return 1
	}
	//slog.Info(fmt.Sprint(mresult))

	// set rest of result:
	// GridFS: this prefers `stderr` as a string in the task document even when it's large, as on failures `stderr` is more likely needed to be parsed
	//         if `stderr` ends up in GridFS, so will `stdout` (unless it is empty)
	total := 0
	bucket := db.GridFSBucket(options.GridFSBucket().SetName("tasks"))
	for _, field := range []string{"stderr", "stdout"} {
		size := 0
		s, ok := result[field].(string)
		if ok {
			size = len(s)
		}
		total += size
		if size != 0 && total > 1024*1024*15 {
			uploadOpts := options.GridFSUpload().SetMetadata(bson.M{"task_id": oid})
			id, err := bucket.UploadFromStream(context.TODO(), field, strings.NewReader(result[field].(string)), uploadOpts)	// FIXME: in perl, wrapped in `retry/catch` (try 10 times with exponential backoff, with a random delay up to 100 milliseconds)
			// FIXME: on_retry would skip retrying if error matched /^MongoDB::DatabaseError: not authorized on /
			if err != nil {
				slog.Error("could not create GridFS content for task "+*taskID+" "+field, "error", err)
				result[field] = nil
			} else {
				result[field] = id
			}
		}
	}

	filter = bson.M{"_id": oid, "status": result["status"], "node": node, "mtime": doc["mtime"]}
	update = bson.M{"$set": bson.M{"stdout": result["stdout"], "stderr": result["stderr"], "complete": true}}
	res, err = db.Collection("tasks").UpdateOne(context.TODO(), filter, update)	// FIXME: in perl, wrapped in `retry/catch` (try 10 times with exponential backoff, with a random delay up to 100 milliseconds)
	// FIXME: on_retry would do this, but i don't think it's necessary with gfs being automatic: $result->{stdout} = "$_" if $_->$_isa('MongoDB::DocumentError') or $_->$_isa('MongoDB::WriteError');
	if err != nil {
		db.Collection("tasks").UpdateOne(context.TODO(), filter, bson.M{"complete": false})
		slog.Error("could not update task " + *taskID + " stdout/stderr after completion", "error", err)
		return 1
	} else if res.MatchedCount == 0 {
		slog.Error("could not find task " + *taskID + " to update stdout/stderr after completion")
		return 1
	}
	//slog.Info(fmt.Sprint(mresult))


	//log.Printf("run_status=%#v, result=%v\n", run_status, result)
	//slog.Info("END")
	return 0
}

// if a string and it can be parsed into a `float64`, it will be
// `int32` becomes `int`, `int` unchanged, `float64` becomes `int` if it looks like one
func mungeStatus(rstatus any) (int, error) {
	var status int
	var err error
	// verify $result is a HASH and $result->{status} is a postive integer, and if not fail task
	// note: result has to be bson.M
	if str, ok := rstatus.(string); ok {
		// NOTE: do we even want to force a string to an integer?
		// rstatus is a string, let's see if it looks like a number
		f, err := strconv.ParseFloat(str, 64)
		if err == nil {
			// yes, looks like a number
			rstatus = f
		}
	}
	// result from mongo gives `int32`, result from json gives `float64`
	if s, ok := rstatus.(int32); ok {
		status = int(s)
	} else if status, ok = rstatus.(int); !ok {
		s, ok := rstatus.(float64)
		if !ok {
			err = &UnknownStatusError{Status: rstatus}
		} else if s == math.Trunc(s) {
			// it looks like an integer, so make it a proper int
			status = int(s)
		} else {
			err = &NonIntegerStatusError{Status: rstatus}
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

type NonIntegerStatusError struct {
	Status any
}

func (e *NonIntegerStatusError) Error() string {
	return fmt.Sprintf("non-integer '%T' for status: %#v", e.Status, e.Status)
}

func mongodb(config Config) (*mongo.Database, error) {
	uri := config.MongoHost
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)	// set Stable API version to 1 (note: not necessary, but a good idea, requires MongoDB 5.0 or newer)
	// note: for Disbatch, if the server API changes, the Perl MongoDB module will break, as it's older than 5.0
	// note: SetMaxPoolSize(1) and SetServerMonitoringMode("poll") reduce the number of connections, useful when many very short tasks
	opts := options.Client().ApplyURI(uri).SetServerAPIOptions(serverAPI).SetMaxPoolSize(1).SetServerMonitoringMode("poll")
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

	var res bson.M
	if err := client.Database("admin").RunCommand(context.TODO(), bson.D{{"ping", 1}}).Decode(&res); err != nil {
		return nil, err
	}
//	fmt.Println("Pinged your deployment. You successfully connected to MongoDB!")
//	fmt.Println(res)

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
}

func logger(config Config) error {
	filename := "/var/log/disbatchd.log"
	if fn, ok := config.Log4perl.Appenders["filelog"].Args["filename"].(string); ok {
		filename = fn
	} else if *testingFlag {
		// likely being ran by a user who cannot write to "/var/log/disbatchd.log"
		filename = "disbatchd.log"
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
	logger := slog.New(slog.NewTextHandler(multi, &slog.HandlerOptions{Level: level}))
	slog.SetDefault(logger)

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

func getStringOrNull(m bson.M, key string) string {
	switch v := m[key].(type) {
	case nil:
		return "null"
	case string:
		return strings.TrimRight(v, "\n")
	default:
		return fmt.Sprint(v)	// stringify like perl
	}
}
