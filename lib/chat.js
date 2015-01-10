var cfg = require("../config");

var Connection = require("ssh2");

var conn = new Connection();

var EventEmitter = require("events").EventEmitter;
var ee = new EventEmitter();

conn.on("ready", function() {
    conn.shell(function(err, stream) {
        if (err) throw err;

        var queue = [];

        module.exports.stream = stream;
        module.exports.send = function(msg) {
            queue.push(msg);
        };

        module.exports.send("/ban cartman");

        setInterval(function() {
            if (queue.length !== 0) {
                stream.write(queue.shift() + "\r");
            }
        }, 1000);

        setTimeout(function() {
            ee.emit("ready");
        }, 1000 * 5);

        stream.on("end", function() {
            process.exit(0);
        });

        stream.on("data", function(data) {
            // Process incoming data
            data = data + "";
            console.log("R: " + data);
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
            data = data.split("\u0007").join("");

            // Don't parse weird artifacts
            if (data != "[" + cfg.name && data != "\u001b[D\u001b[D\u001b[D\u001b[D\u001b[D\u001b[D\u001b" && data !== "") {

                console.log("P: " + data);

                var resp = data.split(" ");

                // Identify join
                if (resp[1] == "*" && resp[3] == "joined.") {
                    ee.emit("chat:join", resp[2]);
                    return;
                }

                // Identify leave
                if (resp[1] == "*" && resp[3] == "left.") {
                    ee.emit("chat:leave", resp[2]);
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

                    ee.emit("chat:whois", resp[1], resp[3]);
                    return;
                }

                // Identify failed WHOIS response
                if (resp[0] == "->" && resp[2] == "such" && resp[3] == "name:") {

                    ee.emit("chat:whoisfail", resp[4]);
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
                if (resp[0] == "**") {
                    resp.shift();
                    nick = resp.shift();

                    var action = resp.join(" ");

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

                    ee.emit("chat:kicked", kicked, resp[5]);
                    return;
                }

                // Identify bans
                if (resp[0] == "*" && resp[3] == "banned") {
                    var banned = resp[1];

                    ee.emit("chat:banned", banned, resp[5]);
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
