/**
 * Created by rpodiuc on 7/12/14.
 */
var fs = require('fs');
var decryption = require('./encrypt.js');
exports.makeConfig = function(){
    var encodedCredentials = process.env.CREDENTIALS;
    var buff = new Buffer(encodedCredentials, 'base64')
    var credentials= decryption.decryptData(buff.toString());
    fs.writeFileSync('tempConfig.json', credentials);
};