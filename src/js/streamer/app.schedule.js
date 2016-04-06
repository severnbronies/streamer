var app = app || {};

app.schedule = function() {
	var self = this;
	var scheduleTemplate;
	this.init = function() {
		scheduleTemplate = $("#tmpl-schedule").html();
		Mustache.parse(scheduleTemplate);
	};
	this.update = function(events) {
		var $schedule = $("[data-schedule-content]");
		$schedule.empty();
		console.log(events);
		$.each(events, function(i, event) {
			if(i < 4) {
				$schedule.append(Mustache.render(scheduleTemplate, event));
			}
		});
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