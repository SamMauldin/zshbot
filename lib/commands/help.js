var entry = require("./entry");

module.exports.execute = function(data) {
    if (data.args[0]) {
        var cmdobj = entry.getCommand(data.args[0]);
        if (cmdobj) {
            entry.reply(data, cmdobj.help || "Help not available for this command");
        } else {
            entry.reply(data, "Command not found or is disabled.");
        }
    } else {
        entry.reply(data, "ZSHBot: https://github.com/Sxw1212/zshbot Commands: help");
    }
};

module.exports.help = "Shows the help.";
