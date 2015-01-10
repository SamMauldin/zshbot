var entry = require("./entry");
var cfg = require("../../config");

module.exports.execute = function(data) {
    if (data.args[0]) {
        var cmdobj = entry.getCommand(data.args[0]);
        if (cmdobj) {
            entry.reply(data, data.args[0] + ": " + (cmdobj.help || "Help not available for this command"));
        } else {
            entry.reply(data, "Command not found or is disabled.");
        }
    } else {
        var cmdlist = [];
        for (var k in cfg.commands) {
            cmdlist.push(k);
        }

        entry.reply(data, "ZSHBot: https://github.com/Sxw1212/zshbot Commands: " + cmdlist.join(", "));
    }
};

module.exports.help = "Shows the help.";
