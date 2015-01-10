var cfg = require("../config");
var http = require("http");
var url = require("url");
var fs = require("fs");

if (cfg.githubCommit.enable) {
    var commitHook = fs.readFileSync(cfg.githubCommit.hook, "utf8");
    commitHook = commitHook.split("\n").join("");
}

http.createServer(function (req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    var path = url.parse(req.url).pathname;

    if (path == "/") {
        if (cfg.log.enable) {
            res.send("Welcome to zshbot! Logs are currently a WIP. Come back soon!");
        } else {
            res.send("You have reached a zshbot server instance without public access.");
        }
        return;
    }

    if (path == "/json" && cfg.log.enable) {
        //res.end(fs.readFileSync(logJSON));
        res.end("{}");
        return;
    } else if (path == "/humans" && cfg.log.enable) {
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
        return;
    }

    if (cfg.githubCommit.enable) {
        if (path == "/" + commitHook) {
            res.end("Successful");
            process.exit(0); // Restart
            return;
        }
    }

    res.end("Unknown Path");
    
}).listen(cfg.log.port);
