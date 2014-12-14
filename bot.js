
// Settings

var ourNick = "zsh"; // Nickname for bot

var dataJSON = "/home/ubuntu/zshbot/joined.json"; // Data storage file

var logJSON = "/home/ubuntu/zshbot/log.json"; // Data storage file

var sshKey = "/home/ubuntu/.ssh/sshbot"; // SSH Private key for bot.

var chatServer = "chat.shazow.net"; // Chat server for bot

var logPort = 8080; // What port to host the log HTTP server on

var logURL = "http://node.fluidnode.com:8080/"; // URL of the log server

var limit = 5; // How many chat messages can be sent per user per five seconds before silence

var nicklimit = 3; // How many times a user can change their nick in ten seconds before ban

var db = {}; // Ignore me

// Format: db["fingerprint"] = ["Nickname", isOP];
db["28:02:ec:aa:0a:44:a3:3a:cc:e7:5e:6c:73:9f:cc:01"] = ["Sam", true];
db["f1:a1:89:6b:87:e9:3b:86:b7:07:4f:cc:08:42:18:7e"] = ["Shazow", true];

// End Settings

var Connection = require("ssh2");

var conn = new Connection();

var run = false;
var users = {};
var nickchange = {};

var currentWhois = null;

setInterval(function() {
	nickchange = {};
}, 1000 * 10);

setInterval(function() {
	run = true;
	users = {};
}, 1000 * 5);

conn.on("ready", function() {
	console.log("Connected");
	conn.shell(function(err, stream) {
		if (err) throw err;

		stream.on("end", function() {
				process.exit(0);
		});

		stream.on("data", function(data) {
			if (!run) { return; }
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

			if (data != "[" + ourNick && data != "\u001b[D\u001b[D\u001b[D\u001b[D\u001b[D\u001b[D\u001b" && data !== "") {

				console.log("Data: " + data + ";");

				// Identify join
				var resp = data.split(" ");
				if (resp[1] == "*" && resp[3] == "joined.") {
					onJoin(resp[2], stream);
					logChat("join", resp[2], resp[2] + " joined.");
				}

				// Identify leave
				if (resp[1] == "*" && resp[3] == "left.") {
					logChat("leave", resp[2], resp[2] + " left.");
				}

				// Identify list response
				if (resp[0] == "->" && resp[2] == "connected:") {
					var list = data.split(":");
					list = list[1].substring(1, list[1].length);
					list = list.split(", ");
					finishList(list, stream);
				}

				// Identify WHOIS response
				if (resp[0] == "->" && resp[4] == "via") {
					finishWhois(resp[3], resp[1], stream);
				}

				// Identify failed WHOIS response
				if (resp[0] == "->" && resp[2] == "such" && resp[3] == "name:") {
					currentWhois = null;
				}

				// Identify speaking for chat
				var nick = data.split(":")[0];
				if (nick.indexOf(" ") == -1 && nick != "/list") {

					if (users[nick]) {
						users[nick] ++;
						if (users[nick] == limit + 1) {
							stream.write("/silence " + nick + " 1m\r");
							stream.write("Dear " + nick + ", please shut up. \r");
						}
					} else {
						users[nick] = 1;
					}

					var msg = data.split(":");
					msg.shift();
					msg = msg.join(":");
					msg = msg.substring(1, msg.length);

					commands(msg, nick, stream);
					logChat("message", nick, msg);
				}

				// Identify speaking for /me
				nick = data.split(" ");
				if (nick[0] == "**") {
					nick = nick[1];

					var action = data.split(" ");
					action.shift(); action.shift();
					action = action.join(" ");

					logChat("action", nick, action);

					if (users[nick]) {
						users[nick] ++;
						if (users[nick] == limit + 1) {
							stream.write("/silence " + nick + " 1m\r");
							stream.write("Dear " + nick + ", please shut up. \r");
						}
					} else {
						users[nick] = 1;
					}
				}

				// Nick change anti-spam
				if (nick[3] == "is" && nick[5] == "known") {
					var newnick = nick[7].substring(0, nick[7].length - 1);
					nick = nick[2];

					logChat("nickchange", newnick, nick + " is now known as " + newnick);

					if (nickchange[nick]) {
						nickchange[newnick] = nickchange[nick] + 1;
						nickchange[nick] = null;

						if (nickchange[newnick] == nicklimit) {
							stream.write("Dear " + newnick + ", if you change your nick again, you'll be banned. \r");
						} else if (nickchange[newnick] > nicklimit) {
							stream.write("Dear " + newnick + ", banning has commenced. \r");
							stream.write("/ban " + newnick + "\r");
						}
					} else {
						nickchange[newnick] = 1;
					}
				}

				// End
			}

		});
	});
});

conn.connect({
	host: chatServer,
	port: 22,
	username: ourNick,
	privateKey: require("fs").readFileSync(sshKey)
});

var silent = false;

var triviaQuestions = [
	["What year was chat.shazow.net made in?", "2014"],
	["What language is this server made in", "go"],
	["What language am I, zsh, written in", "node.js"],
	["What port does SSH run on?", "22"],
	["What service runs on port 443?", "https"],
	["What is the first prime number above 1000?", "1009"],
	["How many bits are in a byte?", "8"],
	["What's the name for Mac OS 10.10", "yosemite"]
];

var triviaQ = null;

function trivia(nick, cmd, stream, answer) {
	if (triviaQ !== null) {
		if (cmd[0]) {
			cmd[0] = cmd[0].toLowerCase();
			if (cmd[0] == triviaQuestions[triviaQ][1]) {
				stream.write("Correct answer! " + nick + " wins!\r");
				triviaQ = null;
			} else if (!answer) {
				stream.write("Incorrect answer\r");
			}
		} else {
			stream.write(triviaQuestions[triviaQ][0] + "\r");
		}
	} else if (!answer) {
		var q = Math.floor(Math.random() * triviaQuestions.length);
		stream.write("New question: " + triviaQuestions[q][0] + "\r");
		triviaQ = q;
	}
}

var log = require(logJSON);

function logChat(type, nick, msg) {
	var logItem = {
		type: type,
		user: nick,
		message: msg,
		isotimestamp: new Date().toISOString(),
		unixtimestamp: new Date().getTime()
	};
	log.push(logItem);
	require("fs").writeFileSync(logJSON, JSON.stringify(log));
}

function commands(msg, nick, stream) {
	console.log(nick + "(" + users[nick] + "): " + msg);
	if (msg == "exit") {
		stream.write("/msg " + nick + " Type /exit to exit.\r");
	}
	var cmd = msg.split(" ");
	if (cmd[0] == ourNick + ",") {
		if ((cmd[1] == "identify" || cmd[1] == "whoami") && !silent) {
			if (currentWhois) {
				stream.write("Busy, please wait.\r");
			} else {
				currentWhois = "identify";
				stream.write("/whois " + nick + "\r");
			}
		} else if (cmd[1] == "easter" && !silent) {
			stream.write("You found an easter egg!\r");
		} else if (cmd[1] == "help" && !silent) {
			stream.write("ZSH command list: ls, sudo, thank, ssh, zsh, log, cat, update, opme, trivia, restart, identify, silence, list, beepme. Made by Sam. https://github.com/Sxw1212/zshbot\r");
		} else if (cmd[1] == "trivia" && !silent) {
			cmd.shift(); cmd.shift();
			trivia(nick, cmd, stream);
		} else if (cmd[1] == "log" && !silent) {
			stream.write("The log can be found at: " + logURL + "\r");
		} else if (cmd[1] == "ls" && !silent) {
			stream.write("Bus Error\r");
		} else if (cmd[1] == "sudo" && !silent) {
			stream.write("Password:\r");
		} else if (cmd[1] == "update" && !silent) {
			stream.write("Upgrading oh-my-zsh... Done!\r");
		} else if (cmd[1] == "ssh" && !silent) {
			stream.write("Connecting... Joined chat!\r");
		} else if (cmd[1] == "beepme" && !silent) {
			stream.write("Beeping " + nick + "...\r");
		} else if (cmd[1] == "zsh" && !silent) {
			stream.write("ZSHCEPTION!\r");
		} else if (cmd[1] == "cat" && !silent) {
			stream.write("Things, Mysterious THINGS.\r");
		} else if (cmd[1] == "thank" && !silent) {
			cmd.shift();
			cmd.shift();
			stream.write("Everybody thanks " + (cmd.join(" ") || "Shazow") + " for their excellent work!\r");
		} else if (cmd[1] == "list") {
			if (!currentWhois) {
				currentWhois = "list";
				stream.write("/whois " + nick + "\r");
			} else {
				stream.write("Busy, please wait.\r");
			}
		} else if (cmd[1] == "opme") {
			if (!currentWhois) {
				currentWhois = "opme";
				stream.write("/whois " + nick + "\r");
			} else {
				stream.write("Busy, please wait.\r");
			}
		} else if (cmd[1] == "silence") {
			if (!currentWhois) {
				currentWhois = "silence";
				stream.write("/whois " + nick + "\r");
			} else {
				stream.write("Busy, please wait.\r");
			}
		} else if (cmd[1] == "restart") {
			if (!currentWhois) {
				currentWhois = "restart";
				stream.write("/whois " + nick + "\r");
			} else {
				stream.write("Busy, please wait.\r");
			}
		} else if (!silent) {
			stream.write("Unknown command.\r");
		}
	} else {
		trivia(nick, cmd, stream, true);
	}
}

var joined = require(dataJSON);

function finishWhois(string, nick, stream) {
	if (currentWhois == "identify") {
		if (db[string]) {
			stream.write("Hello, " + db[string][0] + "\r");
		} else {
			stream.write("Hello, " + string + "\r");
		}
	} else if (currentWhois == "restart") {
		if (db[string] && db[string][1]) {
			process.exit(0);
		} else {
			stream.write("Permission denied.\r");
		}
	} else if (currentWhois == "silence") {
		if (db[string] && db[string][1]) {
			silent = !silent;
			if (silent) {
				stream.write("And the world fell silent.\r");
			} else {
				stream.write("Voices raise around you.\r");
			}
		} else {
			stream.write("Permission denied.\r");
		}
	} else if (currentWhois == "join") {
		if (db[string] && db[string][1]) {
			stream.write("/op " + nick + "\r");
		} else if (!joined[string]) {
			joined[string] = true;
			var unique = 0;
			for (var i in joined) {
				unique++;
			}
			require("fs").writeFileSync(dataJSON, JSON.stringify(joined));
		}
	} else if (currentWhois == "opme") {
		if (db[string] && db[string][1]) {
			stream.write("/op " + nick + "\r");
			stream.write("You have been OPfied.\r");
		} else {
			stream.write("Permission denied.\r");
		}
	} else if (currentWhois == "list") {
		if (db[string] && db[string][1]) {
			stream.write("/list\r");
		} else {
			stream.write("Permission denied.\r");
		}
	}
	currentWhois = null;
}

function finishList(list, stream) {
	stream.write("Indexing, will take " + list.length + " seconds.\r");
	list.forEach(function(v, k) {
		var nick = v;
		setTimeout(function() {
			if (!currentWhois) {
				currentWhois = "join";
				stream.write("/whois " + v + "\r");
			}
		}, (1000 * k) + 100);
	});
	setTimeout(function() {
		var unique = 0;
		for (var i in joined) {
			unique++;
		}
		stream.write("Index complete, " + unique + " unique users have ever connected\r");
	}, (list.length * 1000) + 5000);
}

function onJoin(nick, stream) {
	if (!currentWhois) {
		console.log("Sent join whois");
		currentWhois = "join";
		stream.write("/whois " + nick + "\r");
	} else {
		console.log("Join whois aborted, busy: " + currentWhois);
	}
}

var http = require("http");
var url = require("url");
var fs = require("fs");

http.createServer(function (req, res) {
	res.writeHead(200, {"Content-Type": "text/plain"});
	var path = url.parse(req.url).pathname;
	if (path == "/") {
		res.end("Welcome, human readable log at /humans, API at /json");
	} else if (path == "/json") {
		res.end(fs.readFileSync(logJSON));
	} else if (path == "/humans") {
		var log = JSON.parse(fs.readFileSync(logJSON));
		var humans = "";
		log.forEach(function(v) {
			if (v.type == "message") {
				humans = v.user + ": " + v.message + "\n" + humans;
			} else if (v.type == "action") {
				humans = " ** " + v.user + " " + v.message + "\n" + humans;
			} else if (v.type == "join") {
				humans = " * " + v.user + " joined.\n" + humans;
			} else if (v.type == "leave") {
				humans = " * " + v.user + " left.\n" + humans;
			} else if (v.type == "nickchange") {
				humans = " * " + v.message + "\n" + humans;
			}
		});
		res.end("Latest messages shown at top.\n\n" + humans);
	} else {
		res.end("Unknown Path");
	}
}).listen(logPort);
