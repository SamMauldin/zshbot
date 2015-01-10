var cfg = require("../config");
var chat = require("./chat");
var commands = require("./commands/entry");

function parseCommand(nick, msg, type) {
    var cmd = msg.split(" ");
    if (cmd[0] == "zsh:" || cmd[0] == "zsh,") {
        cmd.shift();
        var cmdobj = commands.getCommand(cmd[0]);
        if (cmdobj) {
            cmd.shift();
            cmdobj.execute({
                from: nick,
                args: cmd,
                messageType: type
            });
        } else {
            if (type == "pm") {
                chat.stream.write("/msg " + nick + " Command not found.\r");
            } else if (type == "msg") {
                chat.stream.write(nick + ": Command not found.\r");
            }
        }
    }
}

chat.on("ready", function() {
    console.log("Ready");

    chat.on("chat:message", function(nick, message) {
        console.log(nick + ": " + message);

        parseCommand(nick, message, "cmd");
    });

    chat.on("chat:privatemessage", function(from, pm) {
        console.log(from + " -> me: " + pm);

        parseCommand(from, pm, "pm");
    });
});
