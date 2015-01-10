var cfg = require("../config");

var Connection = require("ssh2");

var conn = new Connection();

var EventEmitter = require("EventEmitter");
var ee = new EventEmitter();

conn.on("ready", function() {
    conn.shell(function(err, stream) {
        if (err) throw err;

        module.exports.stream = stream;

        setTimeout(function() {
            ee.emit("ready");
        }, 1000 * 5);

        stream.on("end", function() {
            process.exit(0);
        });

        stream.on("data", function(data) {
            // Process incoming data
            data = data + "";
            data = data.substring(0, data.length - 2);

            var splitdata = data.split("\u001b[");
            var newdata = [];
            splitdata.forEach(function(v, k) {
                if (k === 0) {
                    newdata.push(v);
                } else {
                    var newsection = v.split("m");
                    newsection.shift();
                    newdata.push(newsection.join("m"));
                }
            });
            data = newdata.join("");

            // Don't parse weird artifacts
            if (data != "[" + cfg.name && data != "\u001b[D\u001b[D\u001b[D\u001b[D\u001b[D\u001b[D\u001b" && data !== "") {

                // Identify join
                var resp = data.split(" ");
                if (resp[1] == "*" && resp[3] == "joined.") {

                    // TODO
                    return;
                }

                // Identify leave
                if (resp[1] == "*" && resp[3] == "left.") {

                    // TODO
                    return;
                }

                // Identify list response
                /* Currently disabled due to list not showing full list
                if (resp[0] == "->" && resp[2] == "connected:") {

                    // TODO
                    return;
                }
                */

                // Identify WHOIS response
                if (resp[0] == "->" && resp[4] == "via") {

                    // TODO
                    return;
                }

                // Identify failed WHOIS response
                if (resp[0] == "->" && resp[2] == "such" && resp[3] == "name:") {

                    // TODO
                    return;
                }

                // Identify PM
                if(resp[0] == "[PM") {
                    var from = resp[2].split("]").join("");

                    resp.shift();
                    resp.shift();
                    resp.shift();

                    var pm = resp.join(" ");

                    ee.emit("chat:privatemessage", from, pm);
                    return;
                }

                // Identify speaking for chat
                var nick = data.split(":")[0];
                if (nick.indexOf(" ") == -1 && nick != "/list") {
                    var msg = data.split(":");
                    msg.shift();
                    msg = msg.join(":");
                    msg = msg.substring(1, msg.length);

                    ee.emit("chat:message", nick, msg);
                    return;
                }

                // Identify actions
                nick = data.split(" ");
                if (nick[0] == "**") {
                    nick.shift();
                    nick = nick.shift;

                    var action = nick.join(" ");

                    ee.emit("chat:action", nick, action);
                    return;
                }

                // Identify nick changes
                if (nick[3] == "is" && nick[5] == "known") {
                    var newnick = nick[7].substring(0, nick[7].length - 1);
                    nick = nick[2];

                    ee.emit("chat:nickchange", nick, newnick);
                    return;
                }

                // Identify kicks
                if (resp[0] == "*" && resp[3] == "kicked") {
                    var kicked = resp[1];

                    ee.emit("chat:kicked", kicked);
                    return;
                }
            }
        });

    });
});

module.exports = ee;

conn.connect({
    host: cfg.server,
    port: 22,
    username: cfg.name,
    privateKey: require("fs").readFileSync(cfg.privateKey)
});
