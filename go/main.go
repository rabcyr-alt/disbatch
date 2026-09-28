package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"io/fs"
	"log"
	"log/slog"
	"math"
	"os"
	"os/exec"
	"regexp"
	"slices"
	"strconv"
	"strings"
	"syscall"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func main() {
	/* to use logger before parsing the config file:
	logger := logger(Config{})
	*/

	taskID := flag.String("task", "", "The task's _id. Mandatory.")
	configFlag := flag.String("config", "", "Path to the JSON Disbatch config file. Mandatory.")
	quietFlag := flag.Bool("quiet", false, "Suppress STDOUT and STDERR output at end (mainly for testing).")
	testingFlag := flag.Bool("testing", false, "Passed to the Perl task runner with --handoff when running Perl plugins.")
	gfsFlag := flag.String("gfs", "", "NOOP: backcompat")
	flag.Parse()
	// flag.Args() is everything else, a slice, and can be passed an index for individual values
	if *gfsFlag != "" {
		// NOOP: might be passed but does not apply here
	}
	logger0 := logger(Config{})
	if *configFlag == "" {
		logger0.Error("Config file must be passed with --config option")
		flag.Usage()
		os.Exit(2)	// skips any deferred functions
	}

	byteValue, err := os.ReadFile(*configFlag)
	if err != nil {
		panic(err)
	}
	var config Config
	err = json.Unmarshal(byteValue, &config)
	if err != nil {
		panic(err)
	}

	logger := logger(config)

	if *taskID == "" {
		logger.Error("No --task")
		flag.Usage()
		os.Exit(2)	// skips any deferred functions
	}

	node, err := os.Hostname()
	if err != nil {
		panic(err)
	}

	db := mongodb(config)
	defer func() {
		// we want to Disconnect() because idle sessions stay around for 30 minutes on the server
		// so no log.Fatal, os.Exit, etc after calling mongodb()!
		// below wrapped in `func() {...}()` as the args are otherwise evaluated immediately. fine with context.TODO() as it has no timeout but not with others.
		db.Client().Disconnect(context.TODO())
	}()

	log.Printf("Starting task %s", *taskID)

	oid, err := bson.ObjectIDFromHex(*taskID)
	if err != nil {
		logger.Error(err.Error())
		flag.Usage()
		os.Exit(2)	// skips any deferred functions
	}

	// testing: delete and create if given the testing task id
	if *taskID == "65170b42b99efdd0b07d42de" {
		_, err = db.Collection("tasks").DeleteOne(context.TODO(), bson.M{"_id": oid})
		if err != nil {
			panic(err)
		}

		opts := options.UpdateOne().SetUpsert(true)
		_, err = db.Collection("queues").UpdateOne(context.TODO(), bson.M{"_id": oid}, bson.M{"$set": bson.M{"name": "go-test", "plugin": "/root/git/disbatch/t/task-nomongo", "threads": 0}}, opts)
		if err != nil {
			panic(err)
			// probably "duplicate key error", don't care
		}

		params := bson.M{"status": 1, "stdout": "hi", "stderr": "vague warning"}
		_, err = db.Collection("tasks").InsertOne(context.TODO(), bson.M{"_id": oid, "status": -1, "node": node, "mtime": time.Now(), "ctime": time.Now(), "queue": oid, "params": params})
		if err != nil {
			panic(err)
		}
	}

	filter := bson.M{"_id": oid, "status": -1, "node": node}		// bson.D{{"_id", oid}}
	update := bson.M{"$set": bson.M{"status": 0}}
	var doc bson.M
	err = db.Collection("tasks").FindOneAndUpdate(context.TODO(), filter, update).Decode(&doc)	// FIXME: in perl, wrapped in `retry/catch` (try 10 times with exponential backoff, with a random delay up to 100 milliseconds)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			logger.Error("Could not find and set task " + *taskID + " to status 0: " + err.Error());
			os.Exit(2)	// skips any deferred functions
		} else {
			logger.Error("Could not find and set task " + *taskID + " to status 0: " + err.Error());
			os.Exit(2)	// skips any deferred functions
		}
	}

	log.Printf("params for %s: %s", *taskID, doc["params"])

	var queue bson.M
	err = db.Collection("queues").FindOne(context.TODO(), bson.M{"_id": doc["queue"]}).Decode(&queue)
	// NOTE: `queue` may be `{}`
	plugin := queue["plugin"]	// NOTE: may be `nil`
//plugin = "/root/git/disbatch/t/task-nomongo.pl"

	var errmsg string
	var args Plugin
	if plugin == nil {
		errmsg = fmt.Sprintf("No plugin defined for task %v in queue %v", *taskID, doc["queue"])
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

	var run_status RunStatus				// NOTE: perl is `0` on success, hash on failure
	var result bson.M						// NOTE: should always have `status` (positive integer) and optional `stdout` and `stderr` (string, maybe nil)
	if errmsg != "" {
		logger.Error(errmsg)
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
					panic(err)
				}
				err = os.Remove("/tmp/"+*taskID+".json")	// these shouldn't exist, but in case they do
				if err != nil && !errors.Is(err, os.ErrNotExist) {
					var pe *fs.PathError
					if errors.As(err, &pe) {
						log.Printf("op=%s path=%s err=%v err=%T\n", pe.Op, pe.Path, pe.Err, pe.Err)
					}
					panic(fmt.Sprintf("%s => %#v\n", err, err))
				}
				err = os.Remove("/tmp/"+*taskID+"-response.json")	// these shouldn't exist, but in case they do
				if err != nil && !errors.Is(err, os.ErrNotExist) {
					panic(fmt.Sprintf("%s => %#v\n", err, err))
				}
				err = os.WriteFile("/tmp/"+*taskID+".json", []byte(json_task), 0600)
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
						logger.Error("Error trying to delete any pre-existing result for "+*taskID+" in 'results' collection: " + err.Error())
						result = bson.M{"status": 2, "stderr": "Error trying to delete any pre-existing result for "+*taskID+" in 'results' collection: " + err.Error()}
						goto Ran
					}
				}
			}

			status := run_command(plugin.(string), cargs)
			// `0` on success, hash on failure: keys `exit` (integer, or undef on critical failure) and `error` (string) if critical failure or killed by signal
			run_status = parseStatus(status)

			if args.Type == "handoff" {
				var task bson.M
				err := db.Collection("tasks").FindOne(context.TODO(), bson.M{"_id": oid, "node": node}).Decode(&task)	// FIXME: in perl, wrapped in `retry/catch`
				if err != nil {
					if errors.Is(err, mongo.ErrNoDocuments) {
						// FIXME: log $run_status
						logger.Error("Handoff task "+*taskID+" on node "+node+" no longer exists!")
						os.Exit(2)	// skips any deferred functions
					}
					// this really should not happen. log it and $run_status
					logger.Error("Could not find handoff task "+*taskID+" to check status: " + err.Error())
					if !run_status.Success {
						var rs = bson.M{"error": run_status.Error}
						if run_status.Exit != 0 {
							rs["exit"] = run_status.Exit
						}
						logger.Error("Handoff plugin '$plugin' for task "+*taskID+" did not exit cleanly: " + fmt.Sprintf("%#v\n", rs))
					} else {
						logger.Error("Handoff plugin '$plugin' for task "+*taskID+" exited cleanly")
					}
					task = bson.M{"status": 2 }	// will lead to exit below	FIXME: might erase stdout and stderr
				}
				if task["status"] == int32(0) {
					errmsg = "Task "+*taskID+" handoff did not update status"
					if run_status.Success {
						// wtf, returned success
						errmsg += " yet returned success"
						run_status.Success = false
						run_status.Exit = 0
						run_status.Error = errmsg
					}
					logger.Error(errmsg)
					var rs = bson.M{"error": run_status.Error}
					if run_status.Exit != 0 {
						rs["exit"] = run_status.Exit
					}
					rs["stdout"] = task["stdout"]
					rs["stderr"] = task["stderr"]
					stdout,_ := json.Marshal(rs)	// json.Marshal returns a []byte, not a string. wrap `stdout`: `string(stdout)`
					result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "Task handoff did not update status. See stdout for any stdout or stderr it may have set"}
				} else if task["status"] == int32(1) && !run_status.Success {
					// bad for task status to be 1 but $plugin exit code to be non-0, make it a failure
					var rs = bson.M{"error": run_status.Error}
					if run_status.Exit != 0 {
						rs["exit"] = run_status.Exit
					}
					rsout,_ := json.Marshal(rs)
					logger.Error("Handoff plugin '"+plugin.(string)+"' recorded status:1 for task "+*taskID+" but did not exit cleanly: " + string(rsout))
					rs["stdout"] = task["stdout"]
					rs["stderr"] = task["stderr"]
					stdout,_ := json.Marshal(rs)
					result = bson.M{"status": 2, "stdout": string(stdout), "stderr": "Handoff plugin recorded status:1 for task but did not exit cleanly. See stdout for any stdout or stderr it may have set"}
					// need to set status back to 0 for later code to work:
					_, err := db.Collection("tasks").UpdateOne(context.TODO(), bson.M{"_id": oid, "status": 1, "node": node}, bson.M{"$set": bson.M{"status": 0}})	// FIXME: in perl, wrapped in `retry/catch`
					if err != nil {
						logger.Error("Could not update task "+*taskID+" status to 0 after non-clean exit: " + err.Error())
						os.Exit(2)	// skips any deferred functions
					}
				} else {
					os.Exit(0)	// skips any deferred functions
				}
			} else if args.Type == "mongo" {
				err = db.Collection("results").FindOneAndDelete(context.TODO(), bson.M{"_id": oid}).Decode(&result)	// FIXME: in perl, wrapped in `retry/catch` (try 10 times with exponential backoff, with a random delay up to 100 milliseconds)
				if err != nil {
					if err == mongo.ErrNoDocuments {
						logger.Error("Task plugin '"+plugin.(string)+"' did not create a document in 'results' for task "+*taskID);
						result = bson.M{"status": 2, "stderr": "Task plugin did not create a document in 'results' for task"}
					} else {
						logger.Error("Error trying to get result for "+*taskID+" in 'results' collection: " + err.Error())
						result = bson.M{"status": 2, "stderr": "Error trying to get result for "+*taskID+" in 'results' collection: " + err.Error() }
					}
				}
			} else if args.Type == "default" || args.Type == "nomongo" {
				text, err := os.ReadFile("/tmp/"+*taskID+"-response.json")
				if err != nil {
					// cannot read file
					e := "Error reading task plugin '"+plugin.(string)+"' response file /tmp/"+*taskID+"-response.json: "+err.Error()
					logger.Error(e)
					result = bson.M{"status": 2, "stderr": e}
				} else {
					err = json.Unmarshal(text, &result)
					if err != nil {
						// cannot parse json
						logger.Error("Task plugin '"+plugin.(string)+"' saved non-json in file /tmp/"+*taskID+"-response.json")
						result = bson.M{"status": 2, "stdout": text, "stderr": "Task plugin saved non-json in file /tmp/"+*taskID+"-response.json. See stdout for any content it may have set"}
					}
				}
				// remove temp files
				os.Remove("/tmp/"+*taskID+".json")
				if err != nil && !errors.Is(err, os.ErrNotExist) {
					panic(fmt.Sprintf("%s => %#v\n", err, err))
				}
				os.Remove("/tmp/"+*taskID+"-response.json")
				if err != nil && !errors.Is(err, os.ErrNotExist) {
					panic(fmt.Sprintf("%s => %#v\n", err, err))
				}
			}
//		} catch {
//			logger.Error("Thread has uncaught exception: $_");
//			$result = {status => 2, stdout => "Unable to complete", stderr => "Thread has uncaught exception: $_"};
//		};

	}
Ran:
	//log.Printf("run_status=%#v, result=%v\n", run_status, result)

	// verify $result is a HASH and $result->{status} is a postive integer, and if not fail task
	// note: result has to be bson.M
	if str, ok := result["status"].(string); ok {
		// NOTE: do we even want to force a string to an integer?
		// status is a string, let's see if it looks like a number
		f, err := strconv.ParseFloat(str, 64)
		if err == nil {
			// yes, looks like a number
			result["status"] = f
		}
	}
	// result from mongo gives `int32`, result from json gives `float64`
	if s, ok := result["status"].(int32); ok {
		result["status"] = int(s)
	} else {
		s, ok := result["status"].(float64)
		if !ok {
			logger.Error("Task " + oid.String() + " returned unknown type '"+ fmt.Sprintf("%T",result["status"]) +"' as status: " + fmt.Sprintf("%#v", result["status"]))
			result["status"] = 2
		} else if s != math.Trunc(s) {
			logger.Error("Task " + oid.String() + " returned non-integer '"+ fmt.Sprintf("%T",result["status"]) +"' as status: " + fmt.Sprintf("%#v", result["status"]))
			result["status"] = 2
		} else {
			// it looks like an integer, so make it a proper int
			result["status"] = int(s)
		}
	}
	if result["status"].(int) < 1 {
		logger.Error("Task " + oid.String() + " returned other than a positive integer as status: '"+ strconv.Itoa(result["status"].(int)) +"'")
		result["status"] = 2
	}
	//$result->{status} += 0;		# force integer-as-string to integer	NOTE: nothing like this should be needed

	// perl: hash on failure: keys `exit` (integer, or undef on critical failure) and `error` (string) if critical failure or killed by signal
	// RunStatus: success => Success=true, died => Error != "", killed => Error != "" and Exit != 0, plan failure => Exit != 0
	if !run_status.Success && args.Type != "handoff" {
		// note: already handled $run_status for 'handoff'
		if result["status"].(int) == 1 {
			// bad for result status to be 1 but $plugin exit code to be non-0, make it a failure
			var rs = bson.M{"error": run_status.Error}
			if run_status.Exit != 0 {
				rs["exit"] = run_status.Exit
			}
			logger.Error("Plugin '$plugin' recorded status:1 for task "+*taskID+" but did not exit cleanly: " + fmt.Sprintf("%#v\n", rs))
			rs["stdout"] = result["stdout"]
			rs["stderr"] = result["stderr"]
			result = bson.M{"status": 2, "stdout": fmt.Sprintf("%#v\n", rs), "stderr": "Plugin recorded status:1 for task but did not exit cleanly. See stdout for any stdout or stderr it may have set"}
		} else if run_status.Exit == 0 {
			// critical failure, should log it
			logger.Error("Plugin '"+plugin.(string)+"' for task "+*taskID+" had critical failure: ", "error", run_status.Error)
		} else if run_status.Error != "" {
			// killed by signal, should log it
			logger.Error("Plugin '"+plugin.(string)+"' for task "+*taskID+" "+run_status.Error)
		} else {
			// "normal" failure, don't care
		}
	}

	status := "failed"
	if result["status"] == 1 {
		status = "succeeded"
	}
	logger.Info("Task "+*taskID+" " + status+".")
	if !*quietFlag {
		fmt.Fprintf(os.Stderr, "STDOUT: %s\n", getStringOrNull(result, "stdout"))
		fmt.Fprintf(os.Stderr, "STDERR: %s\n", getStringOrNull(result, "stderr"))
	}
	// set status first:
	filter = bson.M{"_id": oid, "status": 0, "node": node}
	update = bson.M{"$set": bson.M{"status": result["status"]}}	// FIXME: change `result["status"]` to `result["status"].(int)`? but it seems to work as-is, and better a wrong value happen than a failure
	_, err = db.Collection("tasks").UpdateOne(context.TODO(), filter, update)	// FIXME: in perl, wrapped in `retry/catch` (try 10 times with exponential backoff, with a random delay up to 100 milliseconds)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// NOTE: i don't think mongo.ErrNoDocuments can happen via UpdateOne?
			logger.Error("Could not update task " + *taskID + " status to "+strconv.Itoa(result["status"].(int))+" after completion: " + err.Error());
			os.Exit(2)	// skips any deferred functions
		} else {
			logger.Error("Could not update task " + *taskID + " status to "+strconv.Itoa(result["status"].(int))+" after completion: " + err.Error());
			os.Exit(2)	// skips any deferred functions
		}
	}
	//logger.Info(fmt.Sprint(mresult))

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
				logger.Error("Could not create GridFS content for task "+oid.String()+" "+field+": " + err.Error())
				result[field] = nil
			} else {
				result[field] = id
			}
		}
	}

	filter = bson.M{"_id": oid, "status": result["status"], "node": node}
	update = bson.M{"$set": bson.M{"stdout": result["stdout"], "stderr": result["stderr"], "complete": true}}
	_, err = db.Collection("tasks").UpdateOne(context.TODO(), filter, update)	// FIXME: in perl, wrapped in `retry/catch` (try 10 times with exponential backoff, with a random delay up to 100 milliseconds)
	// FIXME: on_retry would do this, but i don't think it's necessary with gfs being automatic: $result->{stdout} = "$_" if $_->$_isa('MongoDB::DocumentError') or $_->$_isa('MongoDB::WriteError');
	if err != nil {
		db.Collection("tasks").UpdateOne(context.TODO(), filter, bson.M{"complete": false})
		logger.Error("Could not update task " + *taskID + " stdout/stderr after completion: " + err.Error())
		os.Exit(2)	// skips any deferred functions
	}
	//logger.Info(fmt.Sprint(mresult))


	//log.Printf("run_status=%#v, result=%v\n", run_status, result)
	//logger.Info("END")
}

func mongodb(config Config) *mongo.Database {
	uri := config.MongoHost
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)	// set Stable API version to 1 (note: not necessary, but a good idea, requires MongoDB 5.0 or newer)
	// note: for Disbatch, if the server API changes, the Perl MongoDB module will break, as it's older than 5.0
	opts := options.Client().ApplyURI(uri).SetServerAPIOptions(serverAPI)
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
		panic(err)
	}

	var res bson.M
	if err := client.Database("admin").RunCommand(context.TODO(), bson.D{{"ping", 1}}).Decode(&res); err != nil {
		panic(err)
	}
//	fmt.Println("Pinged your deployment. You successfully connected to MongoDB!")
//	fmt.Println(res)

	return client.Database(config.Database)
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

func logger(config Config) *slog.Logger {
	filename := "/var/log/disbatchd.log"
	if fn, ok := config.Log4perl.Appenders["filelog"].Args["filename"].(string); ok {
		filename = fn
	}

	file, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal(err)	// calls os.Exit, which skips any deferred functions
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

	return logger
}


// perl: returns $status (0 on success) or { died => $_ }
func run_command(command string, args []string) Status {
	cmd := exec.Command(command, args...)
	var status Status
	// send output to STDOUT and STDERR
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err := cmd.Start()
	if err != nil {
		status.Died = err.Error()
	} else {
		fmt.Printf("Process.Pid: %v\n", cmd.Process.Pid)
		err = cmd.Wait()
		var ee *exec.ExitError
		if err != nil && !errors.As(err, &ee) {
			// something really bad happened (not just an exit code nor the process being killed)
			bad := fmt.Errorf("%w", err)
			fmt.Printf("something really bad happened: %s\n", bad)
			status.Died = bad.Error()
		} else if cmd.ProcessState.Success() {
			status.Success = true
		} else if cmd.ProcessState.ExitCode() == -1 {
			status.Status = -1
		} else {
			ws, ok := cmd.ProcessState.Sys().(syscall.WaitStatus)
			if ok {
				status.Status = int(ws)	// like perl `$?`. breaks on windows, don't care
				if ws.CoreDump() {
					// do we care? i think `int(ws)` captures it
				}
			}
		}
	}
	return status
}

/*
var status Status
status.Success = true	//    0: status.Status = 0, status.Died = ""
status.Status = 129		//  129: status.Success = false, status.Died = ""
status.Died = err		// died: status.Status = 0, status.Success = false
*/
// Status 0 could also mean died, hence Success
type Status struct {
	Status     int
	Success    bool
	Died       string
}

type RunStatus struct {
	Success    bool
	Exit       int
	Error      string
}

// Status: success => Success=true, died => Died != "", failed => Status != 0
// perl: `0` on success, hash on failure: keys `exit` (integer, or undef on critical failure) and `error` (string) if critical failure or killed by signal
// RunStatus: success => Success=true, died => Error != "", killed => Error != "" and Exit != 0, plan failure => Exit != 0
func parseStatus(status Status) RunStatus {
	var runStatus RunStatus
	if status.Success {
		runStatus.Success = true
	} else if status.Died != "" {
		runStatus.Error = "died with: " + strings.TrimRight(status.Died, "\n")
	} else if status.Status == -1 {
		runStatus.Error = "could not reap child: $!"	// FIXME: `$!` is a perlvar
	} else if sig := status.Status & 127; sig != 0 {
		runStatus.Exit = 128 + sig
		tail := ""
		if status.Status & 128 != 0 {
			tail = " (core dumped)"
		}
		runStatus.Error = fmt.Sprintf("killed by signal %d%s", sig, tail)
	} else {
		runStatus.Exit = status.Status >> 8
	}
	return runStatus
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
