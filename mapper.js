#!/usr/bin/env node
/**
 * mapper.js functionality
 *
 * step1: imports the credentialGenerator that provides one time credentials
 * step2: downloads from S3 the files mapping the file names received as environment variable
 *        all the files downloaded will reside in /s3/pathInS3/filename
 * step3: loads mapperDriver that will read the configuration from analysis-tools.yml and start the custom mapper
 * step4: when all files downloaded closes stdin end exits
 *  NOTE: the paths commented are the ones on the local machine/repo and the ones uncommented are the ones in docker
 *        image
 *
 */
var fs = require('fs');
var aws = require('aws-sdk');
var mkdirp = require('mkdirp');
var path = require('path');

//decrypt one time credentials
var credentialsGenerator = require('/opt/analysis-tools/fabricateS3Credentials.js');
credentialsGenerator.makeConfig();

//var mapper = require('./mapperDriver.js');
//aws.config.loadFromPath('tempConfig.json');

//load credentials
aws.config.loadFromPath('/opt/analysis-tools/tempConfig.json');

//import mapperDriver that parses analysist-tools.yml and starts mapper proc
var mapper = require('/opt/analysis-tools/mapperDriver.js');

var s3 = new aws.S3();

//remove node and script arguments
var argv = process.argv;
argv.shift();
argv.shift();

len = argv.length;
console.log("number of files to process is", len);

//chunk files in downloading and toDownload so that we don't download all files in the same time
var downloadingFiles = argv.slice(0, 3);
var toBeDownloadedNext = argv.slice(3, argv.length);

//call mapperDriver
var proc = mapper.mapper();
(function() {
    while (downloadingFiles.length !== 0) {
        downloadFile(downloadingFiles.pop());
    }})();

//file downloaded correctly
var filesDownloaded = [];

//files missing
var filesNotDownloaded = [];


function downloadFile(pathInS3) {

    //create /s3/pathInS3...
    mkdirp.sync(path.join("s3", path.dirname(pathInS3)));
    var newFile = path.join("s3/", pathInS3);
    var writeStream = fs.createWriteStream(newFile);

    //download files from s3
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
