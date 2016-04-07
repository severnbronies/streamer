var app = app || {};

app.alert = function() {
	var self = this;
	var alertTemplate;
	this.init = function() {
		alertTemplate = $("#tmpl-message").html();
		Mustache.parse(alertTemplate);
		$("body").append(Mustache.render(alertTemplate, { text: "" }));
	};
	this.message = function(message, duration) {
		var $message = $(".message");
		duration = (typeof duration != 'undefined') ? duration : 5;
		$("[data-message-content]").text(message);
		$message.addClass("message--visible");
		setTimeout(function() {
			$message.removeClass("message--visible");
		}, ((duration + 2) * 1000));
	};
};