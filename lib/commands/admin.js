var entry = require("./entry");
var chat = require("../chat");
var id = require("../id");
var pData = require("../data");
var uuid = require("node-uuid");

var token = uuid();

module.exports.execute = function(data) {
    var pub = id.getUser(data.from);
    var user = pData.getUser(pub);
    if (pub) {
        if (data.args[0] == "token") {
            if (data.args[1]) {
                if (data.args[1] == token) {
                    entry.reply(data, "Correct token, access granted");
                    token = uuid();
                    user.admin = true;
                    pData.setUser(pub, user);
                } else {
                    entry.reply(data, "Incorrect token");
                }
            } else {
                entry.reply(data, "Token printed");
                console.log(token);
            }
        } else if (user.admin) {
            entry.reply(data, "Hi admin!");
        } else {
            entry.reply(data, "Access denied");
        }
    } else {
        entry.reply(data, "Try again in a sec, we're finding your access level");
        chat.send("/whois " + data.from);
    }
};

module.exports.help = "ZSH administration tools";
