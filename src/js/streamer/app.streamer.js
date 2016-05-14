var app = app || {};

app.streamer = function() {
	var self = this;
	var globalSocket, pageSocket;
	var stream, twitter, schedule, alert;
	this.init = function() {
		// Websockets
		globalSocket = io();
		pageSocket = io(window.location.href);
		self.bindSockets();
		// Fire up the modules
		twitter = new app.twitter();
		twitter.init();
		stream = new app.stream();
		stream.init();
		schedule = new app.schedule();
		schedule.init();
		alert = new app.alert();
		alert.init();
		// UI helpers
		app.ui.timeAgo();
	};
	this.bindSockets = function() {
		globalSocket.on("command", function(cmd, params) {
			switch(cmd) {
				case "streamToggle":
					stream.toggle();
					break;
				case "streamNavigate":
					stream.url(params.url);
					break;
				case "scheduleToggle":
					schedule.toggle();
					break;
			}
		});
		globalSocket.on("alert", function(params) {
			alert.message(params.text, params.duration);
		});
		pageSocket.on("tweet", function(tweetData) {
			twitter.update(tweetData);
		});
		pageSocket.on("schedule", function(params) {
			schedule.update(params);
		});
		pageSocket.on("scheduleHide", function(hideThis) {
			schedule.hidden(hideThis);
		})
	};
};