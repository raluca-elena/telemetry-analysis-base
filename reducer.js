/**
 * Created by rpodiuc on 7/12/14.
 */
var request = require('superagent');
var spawn = require('child_process').spawn;
var mkdirp = require('mkdirp');
var path = require('path');
var exec = require('child_process').exec;

//take task ids from env var
var taskIds = process.env.INPUT_TASK_IDS;
console.log("this is my ENV ", taskIds);
taskIds = taskIds.split(" ");
var queue = [];
var MAX = 20;  // only allow 20 simultaneous exec calls
var count = 0;  // holds how many execs are running
var taskUrls = [];

function constructUrlForTaskId(taskId) {
    var taskUrl = "http://tasks.taskcluster.net/" + taskId + "/runs/1/result.json";
    taskUrls.push(taskUrl);
}

taskIds.forEach(function(taskId){
    constructUrlForTaskId(taskId);
});

//console.log("task urls are ", taskUrls);

function getTasksResponse(tasksUrls){
    tasksUrls.forEach(function(url){
        console.log("url is ", url);
        request
            .get(url)
            .end(function (res) {
                var artifacts = res.body['artifacts'];
                var uri = [];
                for (var j  in artifacts) {
                    uri.push(artifacts[j]);
                }
                uri.forEach( function(url) {
                    if (count < MAX) {  // go get the file!
                        count += 1;
                        exec('wget '+url, wget_callback);
                    } else {  // queue it up..
                        queue.push(url);
                    }
                });

            });
    });
}

getTasksResponse(taskUrls);

//download in parallel all the results
function wget_callback(err, stdout, stderr) {
    count -= 1;
    if (queue.length > 0 && count < MAX) {  // get next item in the queue!
        count += 1;
        var url = queue.shift();
        exec('wget '+url, wget_callback);
    }
}
