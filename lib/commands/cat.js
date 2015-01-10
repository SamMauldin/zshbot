var entry = require("./entry");

module.exports.execute = function(data) {
    entry.reply(data, "Meow!");
};

module.exports.help = "Makes cat sounds!";
