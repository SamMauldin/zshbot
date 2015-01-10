var cfg = require("../config");
var chat = require("./chat");

chat.on("ready", function() {
    chat.on("chat:message", function(nick, message) {
        console.log(nick + ": " + message);
    });
});
