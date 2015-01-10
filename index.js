var config = require("./config.json");

// Start modules

require("./lib/chat");
require("./lib/bot");
require("./lib/webserver");

config.features.forEach(function(v) {
    require("./lib/handlers/" + v);
});
