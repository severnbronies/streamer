var app = app || {};

app.stream = function() {
	var self = this;
	this.init = function() {
		//self.url("http://crouton.net/"); // TODO: Change this
	};
	this.url = function(url) {
		console.log("change to", url);
		$("[data-stream-iframe]").attr("src", url);
	};
	this.toggle = function() {
		$("body").toggleClass("stream-collapsed");
	};
};