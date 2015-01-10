var entry = require("./entry");
var chat = require("../chat");
var id = require("../id");

module.exports.execute = function(data) {
    entry.reply(data, "Nick reservation is currently in testing. Talk to Sam if you want in.");
};

module.exports.help = "Nick reservation commands";
