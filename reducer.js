/**
 * reducer.js functionality:
 *
 * step1: check env var INPUT_TASK_IDS and parse it for taskIds of dependent tasks
 * step2: construct urls for downloading results[get artifacts from result.json than results]
 * step3: make directory /mapperOutput
 * step4: download files
 * step5: load reducerDriver and feed file names to it
 * step6: when finished close stdin of subprocess proc
 * NOTE: the paths commented are the ones on the local machine/repo and the ones uncommented are the ones in docker
 *       image
 */
var request = require('superagent');
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');
var email=require('./email');
var reducerDriver = require('./reducerDriver');
var proc = reducerDriver.reduce();

var taskIds = 0;

//parse env var INPUT_TASK_IDS for dependent tasks AKA mapper ids
function getDependents() {
    taskIds = process.env.INPUT_TASK_IDS;
    if (taskIds === undefined){
        console.log("got no dependent tasks");
        process.exit();
    }
    taskIds = taskIds.split(" ");
    console.log("mappers ids ", taskIds);
}

getDependents();

//construct urls for tasks
var taskUrls =taskIds.map(function(taskId) {
    return  "http://tasks.taskcluster.net/" + taskId + "/runs/1/result.json";
});

var queue = [];
var MAX = 20;  // only allow 20 simultaneous mapper result calls
var count = 0;  // how many downloads are running

mkdirp.sync("./mapperOutput");

var parsedResponses = 0;
var filesDownloadedSuccesfully = [];
var filesNotAbleToDownload = [];

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

//parse artifact fields of mapper and get result link for particular task
function parseArtifactOfMapper(res) {
    parsedResponses++;
    var artifacts = res.body['artifacts'];
    if (isEmpty(artifacts))
        console.log("no artifacts found for this task");
    if (artifacts['result'] !== undefined) {
        console.log(" result link : ", artifacts['result']);
        if (count < MAX) {  // go get the file!
            count += 1;
            getResultOfMapper(artifacts['result'], startAnotherDownload);
        } else {  // queue it up..
            queue.push(artifacts['result']);
        }
    }
}

//call for specific mapper result
function getResultOfMapper(url, cb){
    console.log("result is at url ", url);
    request
        .get(url)
        .buffer(true)
        .end(function(res){
            var taskId = url.split("/")[3];
            if (res.ok) {
                var newFile = path.join("./mapperOutput", taskId);
                fs.writeFileSync(newFile, res.text);
                proc.stdin.write(newFile + '\n');
                filesDownloadedSuccesfully.push(taskId);
                if (filesDownloadedSuccesfully.length + filesNotAbleToDownload.length === parsedResponses) {
                    console.log("I CLOSE STDIN");
                    proc.stdin.end();
                }
                cb();
            } else {
                console.log("invalid response for get request ", url);
                filesNotAbleToDownload.push(taskId);
            }
        });
}

//assure MAX downloads in parallel but no more
function startAnotherDownload() {
    count -= 1;
    if (queue.length > 0 && count < MAX) {  // get next item in the queue!
        count += 1;
        var url = queue.shift();
        getResultOfMapper(url, startAnotherDownload);
    }
}

//make calls for mappers result.json
function getAllMappersArtifacts(mappersUrls){
    mappersUrls.forEach(function(url){
        request
            .get(url)
            .end(function (res) {
                if (res.ok) {
                    parseArtifactOfMapper(res);
                } else {
                    console.log("could't get response artifacts for ", url);
                }

            });
    });
}

//start reducer
getAllMappersArtifacts(taskUrls);
