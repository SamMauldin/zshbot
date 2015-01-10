var chat = require("../chat");
var data = require("../data");

chat.on("chat:whois", function(nick, id) {
    var user = data.getUser(id);
    if (user.admin) {
        chat.send("/op " + nick);
    }
});
