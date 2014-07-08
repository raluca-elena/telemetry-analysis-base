exports.mapper = function() {
    var yaml = require('js-yaml');
    var fs = require('fs');
    var child_process = require('child_process');
    var doc = yaml.safeLoad(fs.readFileSync('analysis-tools.yml', 'utf8'));
    var proc;

    //read configuration and spawn accordingly
    if (doc.language == 'binary') {
        proc = child_process.spawn(doc.script, doc.arguments);
    } else if (doc.language == 'javascript') {
        proc = child_process.spawn('node', [doc.script]);
    } else if (doc.language == 'python') {
        proc = child_process.spawn('./helper-functions/python-helper.py', ['mapper'], { stdio: ['pipe', process.stdout, process.stderr]});
    } else {
        console.log("language not supported", doc.language);
        process.exit();
    }
    //return mapper exit code
    proc.on('exit', function (code) {
        console.log("MAPPER exit code ", code);
    });
    //if mapper returned an error print it to console
    proc.on('error', function(err) {
        console.error("mapper experienced this error ", err);
    });

    return proc;
}