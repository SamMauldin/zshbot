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
