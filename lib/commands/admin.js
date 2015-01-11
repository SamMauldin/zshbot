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
            var lookup;
            if (data.args[0] == "user") {
                if (data.args[1] == "lookup") {
                    if (data.args[2]) {
                        lookup = pData.getUser(data.args[2]);
                        if (JSON.stringify(lookup) == "{}") {
                            entry.reply(data, "No data stored for this user");
                        } else {
                            entry.reply(data, "Data object: " + JSON.stringify(lookup));
                        }
                    } else {
                        entry.reply(data, "Usage: admin user lookup [public key]");
                    }
                } else if (data.args[1] == "admin") {
                    if (data.args[2] == "add" && data.args[3]) {
                        lookup = pData.getUser(data.args[3]);
                        lookup.admin = true;
                        pData.setUser(data.args[3], lookup);
                        entry.reply(data, "Admin given");
                    } else if (data.args[2] == "remove" && data.args[3]) {
                        lookup = pData.getUser(data.args[3]);
                        lookup.admin = false;
                        pData.setUser(data.args[3], lookup);
                        entry.reply(data, "Admin removed");
                    } else {
                        entry.reply(data, "Usage: admin user admin [add|remove] [public key]");
                    }
                } else if (data.args[1] == "op") {
                    if (data.args[2] == "add" && data.args[3]) {
                        lookup = pData.getUser(data.args[3]);
                        lookup.op = true;
                        pData.setUser(data.args[3], lookup);
                        entry.reply(data, "OP given");
                    } else if (data.args[2] == "remove" && data.args[3]) {
                        lookup = pData.getUser(data.args[3]);
                        lookup.op = false;
                        pData.setUser(data.args[3], lookup);
                        entry.reply(data, "OP removed");
                    } else {
                        entry.reply(data, "Usage: admin user op [add|remove] [public key]");
                    }
                } else {
                    entry.reply(data, "Usage: admin user [lookup|admin|op]");
                }
            } else if (data.args[0] == "restart") {
                entry.reply(data, "Restarting...");
                setTimeout(function() {
                    process.exit(0);
                }, 5000);
            } else {
                entry.reply(data, "Usage: admin [user|restart]");
            }
        } else {
            entry.reply(data, "Access denied");
        }
    } else if (pub === "") {
        entry.reply(data, "To access authenticated features, generate an SSH key."); 
    } else {
        entry.reply(data, "Try again in a sec, we're finding your access level");
        chat.send("/whois " + data.from);
    }
};

module.exports.help = "ZSHBot administration tools";
