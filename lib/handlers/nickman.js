var chat = require("../chat");
var data = require("../data");

var kicklist = {};

chat.on("chat:whois", function(nick, id) {
    var user = data.getNick(nick);
    if (user) {
        if (user.id != id) {
            if (kicklist[nick]) {
                chat.send("/kick " + nick);
                kicklist[nick] = false;
            } else {
                chat.send(user + ": Warning, you are using a reserved nick. Please change it within 15 seconds. If this is actually your name, please contact Sam.");
                setTimeout(function() {
                    kicklist[nick] = true;
                    chat.send("/whois " + nick);
                }, 1000 * 15);
            }
        } else {
            kicklist[nick] = false;
        }
    }
});
