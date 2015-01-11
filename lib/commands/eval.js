var entry = require("./entry");
var vm = require("vm");

module.exports.execute = function(data) {
    if (data.args[0]) {
        // Wait till timeout is standard
        //vm.runInNewContext("code", {}, {timeout: 1000});
    } else {
        entry.reply(data, "Usage: eval [js]");
    }
};

module.exports.help = "Run JS in a sandbox";
