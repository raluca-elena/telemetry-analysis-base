var yaml = require('js-yaml');
var LineReadableStream = require('line-readable-stream');
var fs   = require('fs');
var child_process = require('child_process');

var doc = yaml.safeLoad(fs.readFileSync('analysis-tools.yml', 'utf8'));
var stdin = process.openStdin();
var pr;

if (doc.language == 'binary') {
    pr = child_process.spawn(doc.script, doc.arguments);
} else if (doc.language == 'javascript') {
    pr = child_process.spawn('node', [doc.script]);
} else if (doc.language == 'python') {
    pr = child_process.spawn('./helper-functions/python-helper.py', ['mapper']);
} else {
    console.log("we don't support this language yet", doc.language);
    // TODO: crash in flames!
}

pr.on('exit', function(code){
    console.log("MAPPER exit code", code);
})

stdin.on('data', function (data) {

    console.log("file sent to mapper", data.toString());
    pr.stdin.write(data + "\n");
});
stdin.on("end", function() { pr.stdin.end(); })
