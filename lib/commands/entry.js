var cfg = require("../../config");

function getCommand(name) {
    if (cfg.commands[name] === true) {
        return require("./" + name);
    }
}

module.exports.getCommand = getCommand;
