/**
 * email.js functionality:
 *
 * step1: reads REDUCER_ID as env variable so it can construct the result link
 * step2: reads OWNER as env variable, this should be an email address where the result link should be sent to
 * step3: constructs message
 * step4: sends message and prints "graph just finished execution :)" if managed to send the email
 */
var reducerId = process.env.REDUCER_ID;
var sendTo = process.env.OWNER;
console.log("reducer id", reducerId);
console.log("sendTo", sendTo);

// create reusable transport method (opens pool of SMTP connections)
var nodemailer = require('nodemailer');
var urlResult = "http://docs.taskcluster.net/tools/task-inspector/#" + reducerId;

// Create a Sendmail transport object
var transport = nodemailer.createTransport("Sendmail", "/usr/sbin/sendmail");
console.log('Sendmail Configured');

// Message object
var message = {

    // sender info
    from: '<' + sendTo + '>' ,

    // Comma separated list of recipients
    to: '<' + sendTo + '>',

    // Subject of the message
    subject: 'Your graph has finished processing ✔', //

    // plaintext body
    text: urlResult,

    // HTML body
    html:'<p><b>Hello</b> graph finished execution. Reducer status can be found at the fillowing url :) </p>'+
        '<p>' + '<a href="' + urlResult + '">result</a></p>',

    // An array of attachments
    attachments:[]
};

exports.sendMail = function sendMail() {
    transport.sendMail(message, function(error){
        if(error) {
            console.log('Error occured while sending mail');
            console.log(error.message);
            return;
        } else {
            console.log("graph just finished execution :) "); // response from the server
        }
    });
};
