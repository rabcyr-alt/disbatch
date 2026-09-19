// go build -o t/task-nomongo t/task-nomongo.go
// port by opus 5.5
package main

import (
	"encoding/json"
	"flag"
	"log"
	"os"
	"strings"
)

type Task struct {
	Params struct {
		Status      *int    `json:"status"`
		Stdout      *string `json:"stdout"`
		Stderr      *string `json:"stderr"`
		LargeStdout *int    `json:"large_stdout"`
		LargeStderr *int    `json:"large_stderr"`
	} `json:"params"`
}

type Result struct {
	Status *int    `json:"status,omitempty"`
	Stdout *string `json:"stdout,omitempty"`
	Stderr *string `json:"stderr,omitempty"`
}

func main() {
	log.SetFlags(0)

	taskFile := flag.String("task", "", "path to task JSON file")
	flag.Parse()

	if *taskFile == "" {
		log.Fatal("No --task")
	}
	base, ok := strings.CutSuffix(*taskFile, ".json")
	if !ok {
		log.Fatal("--task value does not end in '.json'")
	}
	outFile := base + "-response.json"

	data, err := os.ReadFile(*taskFile)
	if err != nil {
		log.Fatal(err)
	}
	var task Task
	if err := json.Unmarshal(data, &task); err != nil {
		log.Fatal(err)
	}

	p := task.Params
	result := Result{Status: p.Status, Stdout: p.Stdout, Stderr: p.Stderr}

	// max size without gfs kicking in is 1024*1024*15 each and total
	if p.LargeStdout != nil {
		s := strings.Repeat("x", *p.LargeStdout)
		result.Stdout = &s
	}
	if p.LargeStderr != nil {
		s := strings.Repeat("x", *p.LargeStderr)
		result.Stderr = &s
	}

	out, err := json.Marshal(result)
	if err != nil {
		log.Fatal(err)
	}
	if err := os.WriteFile(outFile, out, 0666); err != nil {
		log.Fatal(err)
	}
}

/*
The pointer fields let absent params stay absent in the output, same as the original.
Note that `omitempty` on a pointer only drops nil, so an explicit `"stderr": ""` or `"status": 0` still gets written.

`large_*` now always overrides `stdout/stderr` when both are given, rather than depending on hash order.
A negative size will panic in `strings.Repeat`, which seems fine for a test fixture. `strings.CutSuffix` needs Go 1.20+.
*/
