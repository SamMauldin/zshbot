var chat = require("./chat");
var cfg = require("../config");
var log = require(cfg.log.file);

chat.on("ready", function() {
    chat.on("chat:join", function(nick) {

    });

    chat.on("chat:leave", function(nick) {

    });

    chat.on("chat:message", function(nick, message) {

    });

    chat.on("chat:action", function(nick, action) {

    });

    chat.on("chat:nickchange", function(nick, newnick) {

    });

    chat.on("chat:kicked", function(nick, by) {

    });

    chat.on("chat:banned", function(nick, by) {

    });
});
