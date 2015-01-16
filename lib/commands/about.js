var entry = require("./entry");

module.exports.execute = function(data) {
    entry.reply(data, "ZSH by Sam Mauldin. Source: https://github.com/Sxw1212/zshbot");
};

module.exports.help = "Shows bot info";
