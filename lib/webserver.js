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
            res.end("Welcome to zshbot! Logs are available at /json and /humans.");
        } else {
            res.end("You have reached a zshbot server instance without public access.");
        }
        return;
    }

    if (path == "/json" && cfg.log.enable) {
        res.end(fs.readFileSync(cfg.log.file));
        return;
    } else if (path == "/humans" && cfg.log.enable) {
        var log = JSON.parse(fs.readFileSync(cfg.log.file));
        var humans = "";
        log.forEach(function(v) {
            if (v.type == "join") {
                humans = " * " + v.join.who + " joined.\n" + humans;
            } else if (v.type == "leave") {
                humans = " * " + v.leave.who + " left.\n" + humans;
            } else if (v.type == "message") {
                humans = v.message.who + ": " + v.message.message + "\n" + humans;
            } else if (v.type == "action") {
                humans = " ** " + v.action.who + " " + v.action.action + "\n" + humans;
            } else if (v.type == "nickchange") {
                humans = " * " + v.nickchange.oldnick + " is now known as " + v.nickchange.newnick + ".\n" + humans;
            } else if (v.type == "kick") {
                humans = " * " + v.kick.kicked + "was kicked by " + v.kick.by + ".\n" + humans;
            } else if (v.type == "ban") {
                humans = " * " + v.ban.banned + "was banned by " + v.ban.by + ".\n" + humans;
            }
        });

        res.end("Latest messages shown at top.\n\n" + humans);

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

}).listen(cfg.webserver.port);
