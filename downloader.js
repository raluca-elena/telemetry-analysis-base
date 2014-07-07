var fs = require('fs');
var aws = require('aws-sdk');
var mkdirp = require('mkdirp');
var path = require('path');
aws.config.loadFromPath('./config.json');
var s3 = new aws.S3();

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
        mkdirp.sync(path.join("s3", path.dirname(filename)), function(err) {
            if (err)
                console.log("failed to construct this directory ", err);
            else {
                console.log("constructed directory with success ", "s3/" + path.dirname(filename));
                var nameOfFile = path.basename(filename);
                console.log("name of file ", nameOfFile);
            }
            return path.basename(filename);
        });

    }

function createObj(filename) {
    var fileName = makeDirectories(filename)
    var newFile = path.join("s3/", filename);
    var writeStream = fs.createWriteStream(newFile);

    s3.getObject({ Bucket: 'telemetry-published-v1', Key: filename})
        .createReadStream()
        .on("end", function () {
            proc.stdin.write(newFile);
            filesRead.push(filename);
            if (downloadingFiles.length == 0 && toBeDownloadedNext.length == 0) {
                if (filesRead.length === len) {
                    console.log("files downloaded successfully", filesRead);
                    proc.stdin.end();
                }
            } else if (downloadingFiles.length == 0 && toBeDownloadedNext.length > 0) {
                var fileToDownload = toBeDownloadedNext.pop();
                createObj(fileToDownload);
            } else {
                console.log("I SHOULD NOT BE HERE :(((");
            }
        })
        .on("error", function() {
            console.log("got this data as error", arguments,
                " path from s3:", filename,
                " fname:", fileName);
        })
        .pipe(writeStream);

}
