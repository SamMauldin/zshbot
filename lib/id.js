var cfg = require("../config");
var chat = require("./chat");

var users = {};
var whois = {};

chat.on("chat:nickchange", function(nick, newnick) {
    if (users[nick]) {
        users[newnick] = users[nick];
        users[nick] = null;
    } else if (whois[nick]) {
        whois[nick] = false;
        whois[newnick] = true;
        chat.send("/whois " + newnick);
    }
});

chat.on("chat:message", function(nick, msg){
    if (!users[nick] && !whois[nick]) {
        whois[nick] = true;
        chat.send("/whois " + nick);
    }
});

chat.on("chat:join", function(nick) {
    if (!users[nick] && !whois[nick]) {
        whois[nick] = true;
        chat.send("/whois " + nick);
    }
});

chat.on("chat:leave", function(nick) {
    whois[nick] = false;
    if (users[nick]) {
        users[nick] = null;
    }
});

chat.on("chat:whois", function(nick, id) {
    whois[nick] = false;
    users[nick] = id;
});

chat.on("chat:whoisfail", function(nick) {
    whois[nick] = false;
});

function getUser(nick) {
    return users[nick];
}

module.exports.getUser = getUser;
