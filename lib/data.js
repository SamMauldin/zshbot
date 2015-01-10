var cfg = require("../config");
var fs = require("fs");
var data = require(cfg.data);

function save() {
    fs.writeFileSync(cfg.data, JSON.stringify(data));
}

data.users = data.users || {};

function getUser(id) {
    return data.users[id] || {};
}

function setUser(id, obj) {
    data.users[id] = obj;
    save();
}

module.exports.getUser = getUser;
module.exports.setUser = setUser;

data.nicks = data.nicks || {};

function getNick(nick) {
    return data.nicks[nick] || null;
}

function setNick(nick, obj) {
    data.nicks[nick] = obj;
    save();
}

module.exports.getNick = getNick;
module.exports.setNick = setNick;
