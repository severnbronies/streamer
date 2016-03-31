var app = app || {};

app.player = function() {
	var self = this;
	var globalSocket;
	var player;
	this.init = function() {
		globalSocket = io();
		self.initYouTubeApi();
		self.bindSockets();
	};
	this.initYouTubeApi = function() {
		player = new YT.Player("player", {
			width: "100%",
			height: "100%",
			events: {
				"onReady": self.getNextVideo,
				"onStateChange": self.onPlayerStateChange
			},
			playerVars: {
				showinfo: 0,
				rel: 0,
				modestbranding: 1
			}
		});
	};
	this.bindSockets = function() {
		globalSocket.on("command", function(cmd, params) {
			if(cmd == "playerPlayVideo") {
				var playerState = player.getPlayerState();
				if(playerState == YT.PlayerState.ENDED || playerState == YT.PlayerState.CUED || params.force) {
					player.loadVideoById(params.id, 0, "large");
					globalSocket.emit("command", "playerVideoPlaying", { key: ADMIN_KEY });
				}
			}
		});
	};
	this.onPlayerStateChange = function(event) {
		if(event.data == YT.PlayerState.ENDED) {
			self.getNextVideo();
		}
	};
	this.getNextVideo = function() {
		globalSocket.emit("command", "playerNextVideo", { key: ADMIN_KEY });
	}
};