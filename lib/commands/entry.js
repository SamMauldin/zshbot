var cfg = require("../../config");
var chat = require("../chat");

function getCommand(name) {
    if (cfg.commands[name] === true) {
        return require("./" + name);
    }
}

function reply(data, msg) {
    if (data.messageType == "msg") {
        chat.send(data.from + ": " + msg);
    } else if (data.messageType == "pm") {
        chat.send("/msg " + data.from + " " + msg);
    }
}

module.exports.getCommand = getCommand;
module.exports.reply = reply;
