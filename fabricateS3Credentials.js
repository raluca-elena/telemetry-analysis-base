/**
 * Created by rpodiuc on 7/12/14.
 */
var fs = require('fs');
var decryption = require('./encrypt.js');
function makeConfig(){
    var encodedCredentials = process.env.CREDENTIALS;
    var buff = new Buffer(encodedCredentials, 'base64')
    var credentials= decryption.decryptData(buff.toString());
    fs.writeFile('config3.json', credentials, function(){
       console.log("this is my story");
    });
}
makeConfig();