var app = app || {};

app.admin = function() {
	var self = this;
	var globalSocket;
	this.init = function() {
		globalSocket = io();
		self.bindEvents();
		self.bindSockets();
	};
	this.bindEvents = function() {
		$(document).on("click", "[data-command]", function(e) {
 			e.preventDefault();
			var data = $(this).attr("data-params");
			if(typeof data == "undefined") {
				data = {};
			}
			data["key"] = ADMIN_KEY;
 			globalSocket.emit("command", $(this).attr("data-command"), data);
 		});
 		$(document).on("submit", "[data-stream-url]", function(e) {
 			e.preventDefault();
 			globalSocket.emit("command", "streamNavigate", { url: $(this).find("input").val(), key: ADMIN_KEY });
 		});
 		$(document).on("submit", "[data-stream-alert]", function(e) {
 			e.preventDefault();
 			globalSocket.emit("command", "alert", { text: $(this).find("input").val(), duration: 5, key: ADMIN_KEY });
 		});
	};
	this.bindSockets = function() {
		console.log("BIND SOCKETS")
		globalSocket.on("command", function(cmd, params) {
			switch(cmd) {
				case "playerNewRequest":
					console.log("new song", params);
					break;
			}
		});
	};
};