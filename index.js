var settings = require('./config');
var express  = require("express");
var auth = require('basic-auth');
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
		if (params.key == adminKey){
			delete params.key;
			if (cmd == "alert"){
				io.emit("alert",params.text);
			} else if (cmd == "nextsong") {
				playNextSong();
			} else if (cmd == "videoplaying") {
				removeNextSong();
			} else {
				io.emit("command", cmd, params);
			}
		}
	});
});

//Static Content

app.use("/assets", express.static("assets"));
app.use("/screens", express.static("screens"));
app.use("/service", express.static("service"));

//Admin check system
var adminAuth = function(req, res, next) {
  var user = auth(req);
  if (user === undefined || user.name !== 'admin' || user.pass !== settings.adminPassword) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Severn Bronies Streamer Admin Interface"');
    res.end('Unauthorized');
  } else {
    next();
  }
};
var adminKey = (Math.random().toString(36)+'00000000').slice(2, 8+2);

//Requests System

var requestQueue = [],
		requestSet   = {};

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/requests.html");
});

app.get("/request",function(req,res) {
	var songRequest = {
		type: req.query.type,
		id: req.query.id
	};
	if (songRequest.id === undefined) {
		res.send({added:false,error:"Missing id paramater"});
		return;
	}
	if (songRequest.type != "youtube") {
		res.send({added:false,error:"Bad/missig type paramater"});
		return;
	}

	var reqKey = songRequest.type+"::"+songRequest.id,
			status = requestSet[reqKey];
	if (status === undefined){
		requestSet[reqKey] = true;
		if (requestQueue.push(songRequest) == 1){
			//Queue was empty, play now
			playNextSong();
		}
		io.emit("command", "newRequest", songRequest);
		console.log("New request",songRequest);
		res.send({added:true});
	} else if (status === true){
		res.send({added:false,error:"Song is already in queue"});
		console.log("Repeat request",songRequest);
	} else if (status === false){
		res.send({added:false,error:"Song has been banned"});
		console.log("Banned request",songRequest);
	}
	console.log(requestSet); //DEBUG
});

function playNextSong(){
	if (song.length === 0){
		console.log("Queue Empty");
		return;
	}
	var song = requestQueue[0];
	io.emit("command", "playsong", song);
	console.log("Sending song",song);
}

function removeNextSong(){
	var song = requestQueue.shift();
	requestSet[song.type+"::"+song.id] = undefined;
	console.log("Song now playing",song);
}

app.get("/player", adminAuth,function(req,res) {
	res.sendFile(__dirname + "/videoPlayer.html");
});

app.get("/projector", function(req, res) {
	res.sendFile(__dirname + "/projector.html");
});

app.get("/admin", adminAuth, function(req, res) {
	res.sendFile(__dirname+"/admin.html");
});

app.get("/adminKey",adminAuth,function(req, res){
	res.send('var ADMIN_KEY="'+adminKey+'";');
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
