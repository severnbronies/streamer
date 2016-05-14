var settings = require("./config");
var express  = require("express");
var app      = express();
var auth     = require("basic-auth");
var http     = require("http").createServer(app);
var io       = require("socket.io")(http);
var twitter  = require("twitter");
var colors   = require("colors");
var ip       = require("ip");

/**
 * Helpful little bits
 */

var adminKey = (Math.random().toString(36) + "00000000").slice(2, 8 + 2);

var log = {
	CONNECTION: "CONNECTION".white.bgBlack,
	ERROR     : "ERROR     ".white.bgRed,
	COMMAND   : "COMMAND   ".yellow.bgBlack,
	TWITTER   : "TWEET     ".cyan,
	SCHEDULE  : "SCHEDULE  ".magenta,
	PLAYER    : "REQUEST   ".green,
	DEBUG     : "DEBUGGING ".white.bgRed
}

/**
 * App initialisation
 */

http.listen(settings.port, function() {
	console.log(log.CONNECTION, "Streamer started successfully.");
	console.log(log.CONNECTION, "Stream   : " + ip.address() + ":" + settings.port + "/stream");
	console.log(log.CONNECTION, "Admin    : " + ip.address() + ":" + settings.port + "/admin");
	console.log(log.CONNECTION, "Requests : " + ip.address() + ":" + settings.port);
});

/**
 * Authorisation checks
 */
var adminAuth = function(req, res, next) {
	var user = auth(req);
	if(typeof user === "undefined" || user.name !== "admin" || user.pass !== settings.adminPassword) {
		res.statusCode = 401;
		res.setHeader("WWW-Authenticate", "Basic realm=\"Severn Bronies Streamer Admin Interface\"");
		res.end("Unauthorized");
	} 
	else {
		next();
	}
};

/**
 * Command handlers
 */

io.sockets.on("connection", function(socket) {
	// console.log(log.CONNECTION, "New device connected.");
	socket.on("command", function(cmd, params) {
		console.log(log.COMMAND, cmd, params);
		if(params.key === adminKey) {
			delete params.key;
			switch(cmd) {
				case "alert":
					io.emit("alert", params);
					break;
				case "playerNextVideo":
					player.playNextVideo();
					break;
				case "playerVideoPlaying":
					player.removeNextVideo();
					break;
				default:
					io.emit("command", cmd, params);
					break;
			}
		}
	});
});

io.of("/stream").on("connection", function(socket) {
	initTweetstream(socket);
	var showSchedule = new schedule();
	showSchedule.init(socket);
});

/**
 * Routing
 */

// app.use(function(req, res, next) {
// 	res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
// 	res.header("Expires", "-1");
// 	res.header("Pragma", "no-cache");
// 	next();
// });

app.use("/dst", express.static("dst"));
app.use("/screens", express.static("screens"));

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/requests.html");
});

app.get("/stream", function(req, res) {
	res.sendFile(__dirname + "/projector.html");
});

app.get("/player", adminAuth, function(req, res) {
	res.sendFile(__dirname + "/videoPlayer.html");
});

app.get("/admin", adminAuth, function(req, res) {
	res.sendFile(__dirname + "/admin.html");
});

app.get("/adminKey", adminAuth, function(req, res) {
	res.send("var ADMIN_KEY=\"" + adminKey + "\";");
});

/**
 * Requests System
 */

var requestQueue = [];
var requestSet = {};

app.get("/request", function(req, res) {
	var videoRequest = req.query;
	if(typeof videoRequest.id === "undefined") {
		res.send({ added: false, error: "Missing ID parameter" });
		return;
	}
	if(videoRequest.type !== "youtube") {
		res.send({ added: false, error: "Bad/missing type parameter" });
		return;
	}
	var reqKey = videoRequest.type + "::" + videoRequest.id;
	var status = requestSet[reqKey];
	if(typeof status === "undefined") {
		requestSet[reqKey] = true;
		if(requestQueue.push(videoRequest) === 1) {
			player.playNextVideo();
		}
		io.emit("command", "playerNewRequest", videoRequest);
		console.log(log.PLAYER, "New video requested:",  videoRequest.title + " (" + videoRequest.id + ")");
		res.send({ added: true });
	} 
	else if(status === true) {
		res.send({ added: false, error: "Video already in playlist" });
		console.log(log.PLAYER, "Duplicate video requested:",  videoRequest.title + " (" + videoRequest.id + ")");
	} 
	else if(status === false) {
		res.send({ added: false, error: "Video has been banned" });
		console.log(log.PLAYER, "Banned video requested:",  videoRequest.title + " (" + videoRequest.id + ")");
	}
});

var player = {
	playNextVideo: function(){
		if(requestQueue.length === 0){
			console.log(log.PLAYER, "Queue empty.");
			return;
		}
		var video = requestQueue[0];
		io.emit("command", "playerPlayVideo", video);
		console.log(log.PLAYER, "Sending video to player:", video.title + " (" + video.id + ")");
	},
	removeNextVideo: function(){
		var video = requestQueue.shift();
		delete requestSet[video.type + "::" + video.id];
		console.log(log.PLAYER, "Now playing:", video.title + " (" + video.id + ")");
	}
};

/**
 * Twitter streamin'
 */

function initTweetstream(socket) {
	console.log(log.TWITTER, "Initialising tweetstream.");
	var twitterClient = new twitter({
		consumer_key: settings.twitterConsumerKey,
		consumer_secret: settings.twitterConsumerSecret,
		access_token_key: settings.twitterAccessKey,
		access_token_secret: settings.twitterAccessSecret
	});
	twitterClient.get("search/tweets", { q: settings.twitterSearchArchive }, function(error, tweets, response) {
		if(error) {
			console.log(log.ERROR, "Twitter REST API returned error:", error);
			return;
		}
		tweets = tweets.statuses.reverse();
		for(var i = 0; i < tweets.length; i++) {
			console.log(log.TWITTER, "@" + tweets[i].user.screen_name + ":", tweets[i].text);
			socket.emit("tweet", tweets[i]);
		}
	});
	twitterClient.stream("statuses/filter", { track: settings.twitterSearchLive, follow: settings.twitterId }, function(stream) {
		stream.on("data", function(tweet) {
			console.log(log.TWITTER, "@" + tweet.user.screen_name + ":", tweet.text);
			socket.emit("tweet", tweet);
		});
		stream.on("error", function(error) {
			console.log(log.ERROR, "Twitter streaming API returned error:", error);
		});
	});
}

/**
 * Schedule
 */

function schedule() {
	var self = this;
	var pageSocket;
	var lastValidCount = 0;
	var schedule = settings.schedule;
	this.init = function(socket) {
		pageSocket = socket;
		self.update();
		setInterval(self.update, 30000);
	};
	this.update = function() {
		var returnData = [];
		var validCount = 0;
		var timeNow = Math.round(new Date().getTime() / 1000);
		for(var i = 0; i < schedule.length; i++) {
			var timeEvent = Math.round(new Date(schedule[i].timestamp).getTime() / 1000);
			if(timeEvent >= timeNow) {
				validCount++;
				returnData.push({
					name: schedule[i].event,
					timestamp: new Date(schedule[i].timestamp).toISOString()
				});
			}
		}
		if(validCount !== lastValidCount) {
			console.log(log.SCHEDULE, "Updating schedule.");
			lastValidCount = validCount;
			pageSocket.emit("schedule", returnData);
		}
		if(validCount === 0) {
			console.log(log.SCHEDULE, "Schedule empty.");
			pageSocket.emit("scheduleHide", true);
		}
	};
}