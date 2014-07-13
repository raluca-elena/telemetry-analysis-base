#!/usr/bin/env node
var fs = require('fs');
var aws = require('aws-sdk');
var mkdirp = require('mkdirp');
var path = require('path');
var credentialsGenerator = require('opt/analysis-tools/fabricateS3Credentials.js');

credentialsGenerator.makeConfig();

//var mapper = require('./mapper.js');
//aws.config.loadFromPath('tempConfig.json');

aws.config.loadFromPath('/opt/analysis-tools/tempConfig.json');
var mapper = require('/opt/analysis-tools/mapper.js');

var s3 = new aws.S3();

var argv = process.argv;
argv.shift();
argv.shift();
len = argv.length;
console.log("number of files to process is", len);

// commander.js ?
var downloadingFiles = argv.slice(0, 3);
var toBeDownloadedNext = argv.slice(3, argv.length);

var proc = mapper.mapper();
(function() {
    while (downloadingFiles.length !== 0) {
        downloadFile(downloadingFiles.pop());
    }})();

var filesDownloaded = [];
var filesNotDownloaded = [];

function downloadFile(pathInS3) {
    mkdirp.sync(path.join("s3", path.dirname(pathInS3)));
    var newFile = path.join("s3/", pathInS3);
    var writeStream = fs.createWriteStream(newFile);

    s3.getObject({ Bucket: 'telemetry-published-v1', Key: pathInS3})
        .createReadStream()
        .on("end", function () {
            proc.stdin.write(newFile + '\n');
            filesDownloaded.push(pathInS3);
            if (downloadingFiles.length == 0 && toBeDownloadedNext.length == 0) {
                if (filesDownloaded.length  + filesNotDownloaded.length === len) {
                    console.log("files downloaded successfully\n", filesDownloaded);
                    console.log("files that could not be downloaded\n", filesNotDownloaded);
                    proc.stdin.end();
                }
            } else if (downloadingFiles.length == 0 && toBeDownloadedNext.length > 0) {
                var fileToDownload = toBeDownloadedNext.pop();
                downloadFile(fileToDownload);
            } else {
                console.log("I SHOULD NOT BE HERE :(((");
            }
        })
        .on("error", function() {
            console.error("could not download this specific file from s3\n", pathInS3);
            if (downloadingFiles.length == 0 && toBeDownloadedNext.length == 0) {
                console.log("files downloaded successfully\n", filesDownloaded);
                console.log("files that could not be downloaded\n", filesNotDownloaded);
                proc.stdin.end();
                process.exit();
            } else {
                filesNotDownloaded.push(pathInS3);
                return;
            }
        })
        .pipe(writeStream);
}
