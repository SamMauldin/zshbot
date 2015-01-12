var entry = require("./entry");
var id = require("../id");

module.exports.execute = function(data) {
    var users = id.getUsers();
    var uArray = [];
    for (var user in users) {
        if (users[user]) {
            uArray.push(user);
        }
    }
    var people = "";
    uArray.forEach(function(v, k) {
        if (k == uArray.length - 1) {
            people += "and " + v;
        } else {
            people += v + ", ";
        }
    });
    entry.reply(data, "Currently online that I've seen: " + people);
};

module.exports.help = "List of people I've seen that are currently online";
