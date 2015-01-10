var cfg = require("../config");
var chat = require("./chat");

chat.on("ready", function() {
    console.log("Ready");

    chat.on("chat:message", function(nick, message) {
        console.log(nick + ": " + message);
    });

    chat.on("chat:privatemessage", function(from, pm) {
        console.log(from + " -> me: " + pm);
    });
});
