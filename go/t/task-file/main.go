/*
This software is Copyright (c) 2026 by Ashley Willis.

This is free software, licensed under:

  The Apache License, Version 2.0, January 2004

The Go version of t/task-file.pl, a "file" test plugin. It does not connect to MongoDB.
*/

package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strings"

	"go-task-runner/t/testplugin"
)

func main() {
	var taskFile string
	flag.StringVar(&taskFile, "task", "", "task file")
	flag.String("config", "", "config file (not used)")
	flag.Parse()

	if taskFile == "" {
		testplugin.Die("No --task")
	}
	name, ok := strings.CutSuffix(taskFile, ".json")
	if !ok {
		testplugin.Die("--task value does not end in '.json'")
	}
	outFile := name + "-response.json"

	text, err := os.ReadFile(taskFile)
	if err != nil {
		testplugin.Die("could not read task file: %v", err)
	}
	var doc struct {
		Params map[string]any `json:"params"`
	}
	decoder := json.NewDecoder(bytes.NewReader(text))
	decoder.UseNumber() // keep numbers as they are, such as 1.5
	if err = decoder.Decode(&doc); err != nil {
		testplugin.Die("could not parse task file: %v", err)
	}

	result, extra := testplugin.ParamsResult(doc.Params)

	// `raw_response` is written as is, so tests can make invalid responses:
	var response []byte
	if raw, ok := doc.Params["raw_response"]; ok && raw != nil {
		response = []byte(fmt.Sprint(raw))
	} else if response, err = json.Marshal(result); err != nil {
		testplugin.Die("could not create json from result: %v", err)
	}
	if err = os.WriteFile(outFile, response, 0644); err != nil {
		testplugin.Die("could not write response file: %v", err)
	}

	testplugin.Extra(extra)
}
