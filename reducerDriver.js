/**
 * Created by rpodiuc on 7/13/14.
 */
exports.reducer = function() {
    var yaml = require('js-yaml');
    var fs = require('fs');
    var child_process = require('child_process');
    var doc = yaml.safeLoad(fs.readFileSync('analysis-tools.yml', 'utf8'));
    //var doc = yaml.safeLoad(fs.readFileSync('/etc/analysis-tools.yml', 'utf8'));
    var proc;

    //read configuration and spawn accordingly
    if (doc.language == 'binary') {
        proc = child_process.spawn(doc.script, doc.arguments);
    } else if (doc.language == 'javascript') {
        proc = child_process.spawn('node', [doc.script]);
    } else if (doc.language == 'python') {
        proc = child_process.spawn('./python-helper-reducer.py', ['reducer'], { stdio: ['pipe', process.stdout, process.stderr]});
        //proc = child_process.spawn('/opt/analysis-tools/helper-functions/python-helper-reducer.py', ['reducer'], { stdio: ['pipe', process.stdout, process.stderr]});

    } else {
        console.log("language not supported", doc.language);
        process.exit();
    }
    //return reducer exit code
    proc.on('exit', function (code) {
        console.log("REDUCER exit code ", code);
    });
    //if reducer returned an error print it to console
    proc.on('error', function(err) {
        console.error("reducer experienced this error ", err);
    });

    return proc;
}