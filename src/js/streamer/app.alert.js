var app = app || {};

app.alert = function() {
	var self = this;
	var alertTemplate;
	this.init = function() {
		alertTemplate = $("#tmpl-message").html();
		Mustache.parse(alertTemplate);
	};
	this.message = function(message) {
		$("body").append(Mustache.render(alertTemplate, { message: message }));
		$(".message").hide().slideDown();
		setTimeout(function() {
			$(".message").slideUp(function() {
				$(".message").remove();
			});
		}, 5000);
	};
}