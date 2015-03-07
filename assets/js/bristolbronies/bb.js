var bb = {
	log: function(component, message) {
		var formattedDate = "",
		    date = new Date();
		formattedDate += date.getFullYear() + "-" + ("0" + (date.getMonth()+1)).slice(-2) + "-" + ("0" + date.getMonth()).slice(-2);
		formattedDate += " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
		console.log("[" + formattedDate + "]%c " + component, "color: #e02437", message);
	}
};

bb.tweetstream = {
	init: function() {
		bb.tweetstream.checkForUpdate();
		setInterval(bb.tweetstream.checkForUpdate, 10000); // 10 seconds
	},
	checkForUpdate: function() {
		var template = $("#tmpl-tweet").html();
		bb.log("Tweetstream", "Checking for updates...");
		Mustache.parse(template);

		var viewModel = {
			"user": "bristolbronies",
			"avatar": "http://placeponi.es/50/50",
			"time": "2015-04-04T11:00:00",
			"content": "Some words go here! Ha ha! " + Math.random()
		};
		var rendered = Mustache.render(template, viewModel);
		$(".js-tweetstream").prepend(rendered);
		bb.log("Tweetstream", "New tweets added!");

	}
};

bb.schedule = {
	lastTimestamp: 0000000000,
	init: function() {
		bb.schedule.checkForUpdate();
		setInterval(bb.schedule.checkForUpdate, 30000); // 30 seconds
	},
	checkForUpdate: function() {
		var template = $("#tmpl-schedule").html(),
		    timeNow = Math.round(new Date().getTime()/1000);
		bb.log("Schedule", "Checking for updates...");
		Mustache.parse(template);
		$.ajax({
			dataType: "json",
			cache: false,
			url: "/config/schedule.json"
		}).done(function(data) {
			$.each(data.schedule, function(index, event) {
				if(event.timestamp > timeNow) {
					if(event.timestamp != bb.schedule.lastTimestamp) {
						bb.schedule.lastTimestamp = event.timestamp;
						var rendered = Mustache.render(template, event);
						$(".js-schedule-placeholder")
							.fadeOut(function() {
								$(this).html(rendered).fadeIn()
							});
						bb.log("Schedule", "Event updated!");
						return false;
					}
					else {
						bb.log("Schedule", "Event doesn't need updating.")
						return false;
					}
				}
			});
		}).fail(function() {
			console.log("FAILURE");
		});
	}
};

$(document).ready(function() {
	bb.schedule.init();
	bb.tweetstream.init();
});