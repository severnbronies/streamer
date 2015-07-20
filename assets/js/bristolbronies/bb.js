var bb = {};

var hello = "/screens/hello/",
    goodbye = "/screens/goodbye/",
    ponydrome = "https://www.youtube.com/embed/videoseries?list=PL5oyPmRlu5uqI2fyqxDfnGuYmWSJqDCbS&autoplay=1";

bb.stream = {
	init: function() {
		bb.stream.url(hello);
	},
	url: function(url) {
		$("[data-stream-iframe]").attr("src", url);
	},
	toggle: function() {
		$("[data-stream]").toggleClass("stream--collapse");
	}
};

bb.tweetstream = {
	init: function() {

	},
	update: function(tweet) {
		var $tweetstream = $("[data-tweets-list]");
		var template = $("#tmpl-tweet").html();
		Mustache.parse(template);
		var rendered = Mustache.render(template, tweet);
		$tweetstream.prepend($(rendered).hide().fadeIn());
		$tweetstream.children().each(function(index, element) {
			var $element = $(element);
			$element.find("[data-timeago]").timeago();
			if(index > 9) { // max out at 10
				$element.fadeOut(500, function() { $element.remove(); });
			}
		});
	},
	updateMultiple: function(tweets) {
		$.each(tweets, function(i, tweet) {
			bb.tweetstream.update(tweet);
		})
	}
};

bb.schedule = {
	lastTimestamp: 0000000000,
	init: function() {
		bb.schedule.update();
		setInterval(bb.schedule.update, 60000); // 60 seconds
	},
	toggle: function() {
		$("[data-schedule]").slideToggle();
	},
	update: function() {
		var template = $("#tmpl-schedule").html(),
		    timeNow = Math.round(new Date().getTime()/1000);
		Mustache.parse(template);
		$.ajax({
			dataType: "json",
			cache: false,
			url: "/service/schedule.json"
		}).done(function(data) {
			$.each(data.schedule, function(index, event) {
				if(event.timestamp > timeNow) {
					if(event.timestamp != bb.schedule.lastTimestamp) {
						bb.schedule.lastTimestamp = event.timestamp;
						event.humanTime = new Date(parseInt(event.timestamp)*1000).toISOString();
						var rendered = Mustache.render(template, event);
						$("[data-schedule-content]")
							.fadeOut(function() {
								$(this).html(rendered).fadeIn();
								jQuery.timeago.settings.allowFuture = true;
								$(this).find("[data-timeago]").timeago();
							});
						return false;
					}
					else {
						return false;
					}
				}
			});
		});
	}
};

$(document).ready(function() {
	bb.stream.init();
	bb.tweetstream.init();
	bb.schedule.init();
});