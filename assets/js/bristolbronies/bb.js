var bb = {};

var hello = "/screens/hello/",
    goodbye = "/screens/goodbye/",
    ponydrome = "https://www.youtube.com/embed/videoseries?list=PL5oyPmRlu5uqI2fyqxDfnGuYmWSJqDCbS&autoplay=1";

bb.stream = {
	init: function() {
		bb.stream.url(hello);
		bb.tweetstream.init();
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
		setInterval(function() {
			$("[data-timeago]").timeago();
		}, 1000);
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
			if(index > 15) { // max out at 14
				$element.fadeOut(500, function() { $element.remove(); });
			}
		});
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
			var found = false;
			$.each(data.schedule, function(index, event) {
				var eventTime = new Date(event.timestamp).getTime();
				if(eventTime > timeNow) {
					found = true;
					if(eventTime != bb.schedule.lastTimestamp) {
						bb.schedule.lastTimestamp = eventTime;
						event.humanTime = new Date(eventTime).toISOString();
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
			if(found == false) {
				var rendered = Mustache.render(template, {
					timestamp: "",
					event: "Nothing :("
				});
				$("[data-schedule-content]")
					.fadeOut(function() {
						$(this).html(rendered).fadeIn();
					});
			}
		}).fail(function(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown);
		});
	}
};

bb.message = {
	display: function(message) {
		var template = $("#tmpl-message").html();
		var information = {};
		information.message = message;
		Mustache.parse(template);
		$("body").append(Mustache.render(template, information)); 
		$(".message").hide().slideDown();
		setTimeout(function() {
			$(".message").slideUp(function() {
				$(".message").remove();
			});
		}, 10000);
	}
}

$(document).ready(function() {
	bb.stream.init();
	bb.tweetstream.init();
	bb.schedule.init();
});