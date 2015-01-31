var cfg = require("../config");
var chat = require("./chat");
var commands = require("./commands/entry");

function parseCommand(nick, msg, type) {
    var cmd = msg.split(" ");
    if (cmd[0] == "zsh:" || cmd[0] == "zsh," || type == "pm") {
        if (type != "pm") {
            cmd.shift();
        }
        var cmdobj = commands.getCommand(cmd[0]);
        if (cmdobj) {
            cmd.shift();
            try {
                cmdobj.execute({
                    from: nick,
                    args: cmd,
                    messageType: type
                });
            } catch(e) {
                console.log(e);
                if (type == "pm") {
                    chat.send("/msg " + nick + " The command you tried crashed. Tell Sam?");
                } else if (type == "msg") {
                    chat.send(nick + ": The command you tried crashed. Tell Sam?");
                }
            }
        } else {
            if (type == "pm") {
                chat.send("/msg " + nick + " Command not found.");
            } else if (type == "msg") {
                chat.send(nick + ": Command not found.");
            }
        }
    }
}

chat.on("ready", function() {
    console.log("Ready");

    chat.on("chat:message", function(nick, message) {
        parseCommand(nick, message, "msg");
    });

    chat.on("chat:privatemessage", function(from, pm) {
        parseCommand(from, pm, "pm");
    });
});
