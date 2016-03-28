var settings = require('./config');
var express  = require("express");
var app      = express();
var http     = require("http").createServer(app);
var io       = require("socket.io")(http);
var twitter  = require("twitter");

var twitterClient = new twitter({
	consumer_key: settings.twitterConsumerKey,
	consumer_secret: settings.twitterConsumerSecret,
	access_token_key: settings.twitterAccessKey,
	access_token_secret: settings.twitterAccessSecret
});

// Websocket gubbins

io.sockets.on("connection", function(socket) {
	socket.on("connect", function() {
		io.emit("alert", "Connected to control panel.");
	});
	socket.on("disconnect", function() {
		io.emit("alert", "Lost connection to control panel.");
	});
	socket.on("reconnect", function() {
		io.emit("alert", "Reconnected to control panel.");
	});
	socket.on("command", function(cmd, params) {
		console.log("command", cmd, params);
		io.emit("command", cmd, params);
	});
	socket.on("alert", function(msg) {
		io.emit("alert", msg);
	});
});

app.use("/assets", express.static("assets"));
app.use("/screens", express.static("screens"));
app.use("/service", express.static("service"));

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/requests.html");
});

app.get("/projector", function(req, res) {
	res.sendFile(__dirname + "/projector.html");
});

app.get("/admin", function(req, res) {
	res.sendFile(__dirname + "/admin.html");
});

http.listen(settings.port, function() {
	console.log("Listening on port " + settings.port + ".");
});


// Twitter streamin'

twitterClient.stream("statuses/filter", { track: settings.twitterSearch, follow: settings.twitterId }, function(stream) {
	stream.on("data", function(tweet) {
		//console.log("Received tweet from @" + tweet.user.screen_name + ": " + tweet.text);
		io.emit("tweet", tweet);
	});
	stream.on("error", function(error) {
		console.log("Twitter API returned error:");
		console.log(error);
	});
});
