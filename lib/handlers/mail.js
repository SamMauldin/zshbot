var chat = require("../chat");
var id = require("../id");
var pData = require("../data");

chat.on("chat:message", function(nick, message) {
    var user = pData.getNick(nick);
    if (user && user.mailAlert) {
        setTimeout(function() {
            if (user.id == id.getUser(nick)) {
                chat.send("/msg " + nick + " You have mail! PM me 'mail' to check!");
                user.mailAlert = false;
                pData.setNick(nick, user);
            }
        }, 5000);
    }
});
