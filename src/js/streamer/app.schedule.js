var app = app || {};

app.schedule = function() {
	var self = this;
	var scheduleTemplate;
	this.init = function() {
		scheduleTemplate = $("#tmpl-schedule").html();
		Mustache.parse(scheduleTemplate);
	};
	this.update = function(event) {
		$("[data-schedule-content]").fadeOut(function() {
			$(this).html(Mustache.render(scheduleTemplate, event)).fadeIn();
		});
		self.toggle(event.hidden);
	};
	this.toggle = function(hidden) {
		if(hidden === true) {
			$("[data-schedule]").slideUp();
		}
		else {
			$("[data-schedule]").slideDown();
		}
	};
};