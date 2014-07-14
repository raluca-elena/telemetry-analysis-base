/**
 * fabricateS3Credentials.js functionality:
 *
 * step1: read credentials as env variable CREDENTIALS
 * step2: decrypt credentials
 * step3: write credentials to tempConfig.json
 */
var fs = require('fs');
//var decryption = require('./encrypt.js');
var decryption = require('/opt/analysis-tools/encrypt.js');

exports.makeConfig = function(){
    var encodedCredentials = process.env.CREDENTIALS;
    var buff = new Buffer(encodedCredentials, 'base64')
    var credentials= decryption.decryptData(buff.toString());
    fs.writeFileSync('/opt/analysis-tools/tempConfig.json', credentials);
};