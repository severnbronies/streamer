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
		$(document).on("click", "[name='run-command']", function(e) {
 			e.preventDefault();
 			var $this = $(this)
 			var command = $this.attr("data-cmd");
			var params = $this.attr("data-params");
			console.log(params);
			if(typeof params == "undefined") {
				params = {};
			}
			else {
				params = $.parseJSON(params);
			}
			params.key = ADMIN_KEY;
			console.log("command", command, params);
 			globalSocket.emit("command", command, params);
 		});
 		$(document).on("submit", "[data-stream-url]", function(e) {
 			e.preventDefault();
 			globalSocket.emit("command", "streamNavigate", { url: $(this).find("input").val(), key: ADMIN_KEY });
 		});
 		$(document).on("submit", "[data-stream-alert]", function(e) {
 			e.preventDefault();
 			var message = $(this).find("input").val();
 			if(message != "") {
	 			globalSocket.emit("command", "alert", { text: message, duration: $(this).find("select").val(), key: ADMIN_KEY });
	 			$(this).find("input").val("");
	 		}
 		});
	};
	this.bindSockets = function() {
		console.log("BIND SOCKETS");
		globalSocket.on("command", function(cmd, params) {
			switch(cmd) {
				case "playerNewRequest":
					console.log("new video", params);
					var template = $("#tmpl-result").html();
					params.jsonData = JSON.stringify(params);
					$("[data-ponydrome-queue]").append(Mustache.render(template, params));
					break;
				case "playerPlayVideo":
					console.log("playing video", params);
					$("[data-ponydrome-queue]").find(".results__item").removeClass("results__item--current");
					$("[data-ponydrome-queue]").find("#" + params.id).addClass("results__item--current");
					break;
			}
		});
	};
};