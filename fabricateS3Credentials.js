/**
 * Created by rpodiuc on 7/12/14.
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