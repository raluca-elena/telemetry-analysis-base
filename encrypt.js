//#!/usr/bin/env node
"use strict";

/**
 * encrypt.js functionality:
 * because the credentials can be quite large we use not only RSA but we do the following
 * -------------------------------------------------encryption----------------------------------------------------------
 * step1: generate symmetric key
 * step2: encrypt credentials with symmetric key
 * step3: encrypt symmetric key with public key
 * step4: send both encrypted symmetric key and encrypted credentials
 * -------------------------------------------------decryption-----------------------------------------------------------
 * step1: decrypt symmetric key with private key
 * step2: decrypt credentials with symmetric key
 * step3: send decrypted credentials
 */
var assert = require("assert");
var ursa = require("ursa");
var fs = require("fs");
var crypto = require('crypto');
var node_cryptojs = require('node-cryptojs-aes');

var fixture = {
    "PRIVATE_KEY": fs.readFileSync("/opt/analysis-tools/key.pem"),
    "PLAINTEXT": "happyUnicorn",
    "BASE64": "base64",
    "UTF8": "utf8",
    "HEX": "hex"
}

var privKey = ursa.createPrivateKey(fixture.PRIVATE_KEY);
var CryptoJS = node_cryptojs.CryptoJS;
var JsonFormatter = node_cryptojs.JsonFormatter;

exports.encryptData = function encryptData(data){
    var symmetricKey = crypto.randomBytes(128);
    var symmetricKeyB64 = symmetricKey.toString("base64");
    var encryptedCredentials = CryptoJS.AES.encrypt(data, symmetricKeyB64, { format: JsonFormatter });
    var encryptedSymmetricKey = key.encrypt(symmetricKeyB64, fixture.BASE64, fixture.BASE64);
    var response = {};
    response["credentials"] = encryptedCredentials.toString();
    response["symmetricKey"] = encryptedSymmetricKey;
    return response;
};

exports.decryptData = function decryptData(data){
    var encryptedCredentials = JSON.parse(data);
    var symmetricKey = encryptedCredentials["symmetricKey"];
    var credentials = encryptedCredentials["credentials"];
    var decriptedSymmKey = privKey.decrypt(symmetricKey, fixture.BASE64, fixture.BASE64);
    var credentials = CryptoJS.AES.decrypt(credentials, decriptedSymmKey, { format: JsonFormatter });
    return CryptoJS.enc.Utf8.stringify(credentials);
};