var entry = require("./entry");
var cfg = require("../../config");

module.exports.execute = function(data) {
    entry.reply(data, "The log is available at " + cfg.log.url);
};

module.exports.help = "Shows description of the log";
