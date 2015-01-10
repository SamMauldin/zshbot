var entry = require("./entry");
var chat = require("../chat");
var id = require("../id");
var pData = require("../data");

module.exports.execute = function(data) {
    var pub = id.getUser(data.from);
    var user = pData.getUser(pub);
    if (pub) {
        if (user.admin) {
            var lookup;
            if (data.args[0] == "set") {
                if (data.args[2]) {
                    pData.setNick(data.args[1], {
                        id: data.args[2]
                    });
                    entry.reply(data, "Nickman activated.");
                } else {
                    entry.reply(data, "Usage: nickman set [nick] [public key]");
                }
            } else if (data.args[0] == "del") {
                if (data.args[1]) {
                    pData.setNick(data.args[1], {});
                } else {
                    entry.reply(data, "Usage: nickman del [nick]");
                }
            } else if (data.args[0] == "get"){
                if (data.args[1]) {
                    lookup = pData.getNick(data.args[1]);
                    if (lookup.id) {
                        entry.reply(data, "Key: " + lookup.id);
                    } else {
                        entry.reply(data, "Nickman not active for that nick");
                    }
                } else {
                    entry.reply(data, "Usage: nickman get [nick]");
                }
            } else {
                entry.reply(data, "Usage: nickman [set|del|get]");
            }
        } else {
            entry.reply(data, "Access denied, ask Sam to get your name reserved.");
        }
    } else {
        entry.reply(data, "Try again in a sec, we're finding your access level.");
        chat.send("/whois " + data.from);
    }
};

module.exports.help = "Nick reservation commands";
