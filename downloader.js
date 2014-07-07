var fs = require('fs');
var aws = require('aws-sdk');
var mkdirp = require('mkdirp');
var path = require('path');

aws.config.loadFromPath('./config.json');
var s3 = new aws.S3();
//
var argv = process.argv;
argv.shift();
argv.shift();
len = argv.length;
console.log("number of files to process is", len);
//poate facut mai bine cu commander.js ?
var downloadingFiles = argv.slice(0, 3);
var toBeDownloadedNext = argv.slice(3, argv.length);

var proc = require('child_process').spawn('node', ['./mapper.js']);

//write to parent stdout proc stdout
proc.stdout.on('data', function (data) {
    console.log('mapper stdout: ' + data);
});

//write to parent stderr proc stderr
proc.stderr.on('data', function(data) {
    process.stderr.write(data);
});

(function() {
    while (downloadingFiles.length !== 0) {
        createObj(downloadingFiles.pop());
    }})();

var filesRead = [];
function makeDirectories(filename) {
    console.log("from this file name to " + filename + " path--------------- " + path.dirname(filename));
    mkdirp.sync("s3/" + path.dirname(filename));

}

function createObj(filename) {

    console.log("from this file name to " + filename + " path--------------- " + path.dirname(filename));
    var pathSplit = filename.split('/');
    var fname = pathSplit.pop();
    var dirPath = pathSplit.join('/');
    var dr = "s3/" + dirPath;

    mkdirp(dr, function (err) {
        if (err)
            console.error("error from this directory", err)
        else {
            var newFile = dr + "/" + fname;
            var writeStream = fs.createWriteStream(newFile);

            s3.getObject({ Bucket: 'telemetry-published-v1', Key: filename})
                .createReadStream()
                .on("end", function () {

                    proc.stdin.write(newFile);
                    filesRead.push(filename);
                    if (downloadingFiles.length == 0 && toBeDownloadedNext.length == 0) {
                        if (filesRead.length === len) {
                            console.log("files downloaded succesfully", filesRead);
                            proc.stdin.end();
                        }
                    } else if (downloadingFiles.length == 0 && toBeDownloadedNext.length > 0) {
                        var x = toBeDownloadedNext.pop();
                        createObj(x);
                    } else {
                        console.log("I SHOULD NOT BE HERE :(((");
                    }
                })
                .on("error", function() {
                    console.log("got this data as error", arguments,
                        " path from s3:", filename,
                        " fname:", fname);
                })
                .pipe(writeStream);
        }
    });}
