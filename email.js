/**
 * Created by rpodiuc on 7/13/14.
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
