/**
 * Created by rpodiuc on 7/12/14.
 */
var request = require('superagent');
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');
//var reducerDriver = require('./reducerDriver.js');
var reducerDriver = require('/opt/analysis-tools/reducerDriver.js');
var proc = reducerDriver.reduce();

var taskIds = 0;
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
                    proc.stdin.end();
                }
                cb();
            } else {
                console.log("invalid response for get request ", url);
                filesNotAbleToDownload.push(taskId);
            }
        });
}

function startAnotherDownload() {
    count -= 1;
    if (queue.length > 0 && count < MAX) {  // get next item in the queue!
        count += 1;
        var url = queue.shift();
        getResultOfMapper(url, startAnotherDownload);
    }
}

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

getAllMappersArtifacts(taskUrls);
