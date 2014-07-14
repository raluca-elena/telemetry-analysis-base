var taskcluster = require('taskcluster-client');
var request = require('superagent-promise');

// Create Client class

// Instantiate an instance of MyClient
var queue = new taskcluster.Queue({
    credentials: {
        clientId:     'insert credentials here',
        accessToken:  'insert credentials here'
    }
});

task = {
    version: "0.2.0",
    provisionerId: "aws-provisioner",
    workerType: "aufs-worker",
    routing: "task-testing.task-creator",
    timeout: 1200,
    retries: 5,
    priority: 5,
    created: new Date().toISOString(),
    deadline: new Date(+new Date + 12096e5).toISOString(),
    payload: {
        image:    'registry.taskcluster.net/raluca/telemetry-mr-base',     // docker image identifier
        command:  [             // Command followed by arguments to execute
            'node', '/bin/mapper/mapper.js',
            "saved_session/Fennec/nightly/22.0a1/20130227030925.20131101.v2.log.cc03cd521ba84613808daf1e0d6d3ab6.lzma",
            "saved_session/Fennec/nightly/22.0a1/20130329030904.20140310.v2.log.8ecdaa95df95421a8f50f7571d2c8954.lzma",

        ],
        env: { KEY: 'value' },  // Environment variables for the container
        features: {             // Set of optional features
            bufferLog:    false,  // Debug log everything to result.json blob
            azureLiveLog: true,   // Live log everything to azure, see logs.json
            artifactLog:  false   // Log every to an artifact uploaded at end of run
        },
        artifacts: {
            // Name:              Source:
            'passwd.txt':         '/etc/passwd',
            'result': '/bin/mapper/result.txt'
        },
        maxRunTime:             600 // Maximum allowed run time
    },
    metadata: {
        name: "A _custom_ task",
        description: "A **super** quick test task from task creator tool.",
        owner: "r@g.com",
        source: "http://docs.taskcluster.net/tools/task-creator/"
    },
    tags: {
        kind: "one-time-task"
    }
}

// Make a request with a method on myClient
queue.createTask(task).then(function(result) {
    console.log("MUA HA HA!");
    console.log("result is-----", result);
    request('GET', 'http://google.com').
        end().
        then(function onResult(res) {
            console.log("res is ", res);
            console.log("returning from get google.com");
        });

});