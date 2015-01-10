var cfg = require("./cfg");
var http = require("http");
var url = require("url");
var fs = require("fs");

var commitHook = fs.readFileSync(cfg.githubCommit.hook, "utf8");
commitHook = commitHook.split("\n").join("");

// TODO: Respect enable flags

http.createServer(function (req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    var path = url.parse(req.url).pathname;
    if (path == "/") {
        res.end("Welcome, human readable log at /humans, API at /json");
    } else if (path == "/json") {
        //res.end(fs.readFileSync(logJSON));
        res.end("{}");
    } else if (path == "/humans") {
        /*var log = JSON.parse(fs.readFileSync(logJSON));
        var humans = "";
        log.forEach(function(v) {
            if (v.type == "message") {
                humans = v.user + ": " + v.message + "\n" + humans;
            } else if (v.type == "action") {
                humans = " ** " + v.user + " " + v.message + "\n" + humans;
            } else if (v.type == "join") {
                humans = " * " + v.user + " joined.\n" + humans;
            } else if (v.type == "leave") {
                humans = " * " + v.user + " left.\n" + humans;
            } else if (v.type == "nickchange") {
                humans = " * " + v.message + "\n" + humans;
            }
        });
        res.end("Latest messages shown at top.\n\n" + humans);
        */
        res.end("Currently disabled, coming soon");
    } else if (path == "/" + commitHook) {
        res.end("Successful");
        process.exit(0); // Restart
    } else {
        res.end("Unknown Path");
    }
}).listen(logPort);
