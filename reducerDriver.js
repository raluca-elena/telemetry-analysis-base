/**
 * reducerDriver functionality:
 *
 * step1: load analysis-tools.yml
 * step2: read configuration in analysis-tools.yml
 * step3: spawn reducer
 * step4: send mail when reducer finished (you might not receive this email depending on network conf/ISP :()
 * NOTE: the paths commented are the ones on the local machine/repo and the ones uncommented are the ones in docker
 *       image
 */
//load email module
var email=require('./email');


//parse analysis-tools.yml and spawn reducer
exports.reduce = function() {
    var yaml = require('js-yaml');
    var fs = require('fs');
    var child_process = require('child_process');
    //var doc = yaml.safeLoad(fs.readFileSync('analysis-tools.yml', 'utf8'));
    var doc = yaml.safeLoad(fs.readFileSync('/etc/analysis-tools.yml', 'utf8'));
    var proc;

    //read configuration and spawn accordingly
    if (doc.language == 'binary') {
        proc = child_process.spawn(doc.script, doc.arguments);
    } else if (doc.language == 'javascript') {
        proc = child_process.spawn('node', [doc.script]);
    } else if (doc.language == 'python') {
        //proc = child_process.spawn('./python-helper-reducer.py', ['reducer'], { stdio: ['pipe', process.stdout, process.stderr]});
        proc = child_process.spawn('/opt/analysis-tools/helper-functions/python-helper-reducer.py', ['reducer'], { stdio: ['pipe', process.stdout, process.stderr]});
    } else {
        console.log("language not supported", doc.language);
        process.exit();
    }

    //return reducer exit code
    proc.on('exit', function (code) {
        console.log("REDUCER exit code ", code);

        //send email on exit
        email.sendMail();
    });

    //if reducer returned an error print it to console
    proc.on('error', function(err) {
        console.error("reducer experienced this error ", err);
    });

    return proc;
}
