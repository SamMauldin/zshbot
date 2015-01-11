var chat = require("./chat");
var cfg = require("../config");
var fs = require("fs");
var log = require(cfg.log.file);

function save() {
    fs.writeFileSync(cfg.log.file, JSON.stringify(log));
}

function clear() {
    log = [];
    save();
}

module.exports.clear = clear;

chat.on("ready", function() {
    chat.on("chat:join", function(nick) {
        log.push({
            "timestamp": new Date().toISOString(),
            "type" : "join",
            "join" : {
                "who" : nick
            }
        });
        save();
    });

    chat.on("chat:leave", function(nick) {
        log.push({
            "timestamp": new Date().toISOString(),
            "type" : "leave",
            "leave" : {
                "who" : nick
            }
        });
        save();
    });

    chat.on("chat:message", function(nick, message) {
        log.push({
            "timestamp": new Date().toISOString(),
            "type" : "message",
            "message" : {
                "who" : nick,
                "message" : message
            }
        });
        save();
    });

    chat.on("chat:action", function(nick, action) {
        log.push({
            "timestamp": new Date().toISOString(),
            "type" : "action",
            "action" : {
                "who" : nick,
                "action" : action
            }
        });
        save();
    });

    chat.on("chat:nickchange", function(nick, newnick) {
        log.push({
            "timestamp": new Date().toISOString(),
            "type" : "nickchange",
            "nickchange" : {
                "oldnick" : nick,
                "newnick" : newnick
            }
        });
        save();
    });

    chat.on("chat:kicked", function(nick, by) {
        log.push({
            "timestamp": new Date().toISOString(),
            "type" : "kick",
            "kick" : {
                "kicked" : nick,
                "by" : by
            }
        });
        save();
    });

    chat.on("chat:banned", function(nick, by) {
        log.push({
            "timestamp": new Date().toISOString(),
            "type" : "ban",
            "ban" : {
                "banned" : nick,
                "by" : by
            }
        });
        save();
    });
});
