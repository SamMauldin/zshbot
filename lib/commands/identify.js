var entry = require("./entry");
var chat = require("../chat");
var id = require("../id");

module.exports.execute = function(data) {
    if (data.args[0]) {
        var pub = id.getUser(data.args[0]);
        if (pub) {
            entry.reply(data, "Found: " + pub);
        } else if (pub === "") {
            entry.reply(data, "This user is connected as a guest. No authenticated features available.");
        } else {
            entry.reply(data, "User not currently found. We're checking, so ask again in a few seconds.");
            chat.send("/whois " + data.args[0]);
        }
    } else {
        entry.reply(data, "Usage: identify [nick]");
    }
};

module.exports.help = "Gets the public keys of online users";
