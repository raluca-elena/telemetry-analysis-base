var fs = require('fs');
var aws = require('aws-sdk');
aws.config.loadFromPath('/bin/mapper/config.json');
var s3 = new aws.S3();
var argv = process.argv;
argv.shift();
argv.shift();
len = argv.length;
console.log("number of files to process is", len);
var toDownload = argv.slice(0, 3);
var y = argv.slice(3, argv.length);

var proc = require('child_process').spawn('node', ['/bin/mapper/mapper.js']);

//write to parent stdout proc stdout
proc.stdout.on('data', function (data) {
    console.log('mapper stdout: ' + data);
});

//write to parent stderr proc stderr
proc.stderr.on('data', function(data) {
    process.stderr.write(data);
});

(function() {
    while (toDownload.length !== 0) {
        createObj(toDownload.pop());
    }})();

var filesRead = [];
function createObj(filename) {
    var writeStream = fs.createWriteStream('./' + filename.split('/').join('-'));
    s3.getObject({ Bucket: 'telemetry-published-v1', Key: filename})
        .createReadStream()
        .on("end", function () {
            proc.stdin.write(filename.split('/').join('-'));
            filesRead.push(filename);
            if (toDownload.length == 0 && y.length == 0) {
                if (filesRead.length === len) {
                    console.log("files downloaded succesfully", filesRead);
                    proc.stdin.end();
                }
            } else if (toDownload.length == 0 && y.length > 0) {
                var x = y.pop();
                createObj(x);
            } else {
                console.log("I SHOULD NOT BE HERE :(((");
            }
        })
        .on("error", function() { console.log("got this data as error", arguments); })
        .pipe(writeStream);
}