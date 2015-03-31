var bb = {
	log: function(component, message, color) {
		color = typeof color != "undefined" ? color : "#e02437";
		var formattedDate = "",
		    date = new Date();
		formattedDate += date.getFullYear() + "-" + ("0" + (date.getMonth()+1)).slice(-2) + "-" + ("0" + date.getMonth()).slice(-2);
		formattedDate += " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
		console.log("[" + formattedDate + "]%c " + component, "color: " + color, message);
	}
};

var hello = "/screens/welcome/",
    goodbye = "/screens/goodbye/",
    quiz = "/screens/quiz/",
    quiza = "/screens/quiz/answers.html",
    ponydrome = "https://www.youtube.com/embed/videoseries?list=PL5oyPmRlu5uqI2fyqxDfnGuYmWSJqDCbS";

bb.stream = {
	init: function() {
		bb.stream.url(hello);
	},
	url: function(url) {
		$(".js-streamer").attr("src", url);
		bb.log("Streamer", "Changed frame to " + url);
	},
	toggle: function() {
		$(".stream").toggleClass("stream--collapse");
	}
};

bb.tweetstream = {
	loadedTweets: [],
	init: function() {
		bb.tweetstream.update();
		setInterval(bb.tweetstream.update, 30000); // 30 seconds
	},
	update: function() {
		var template = $("#tmpl-tweet").html();
		bb.log("Tweetstream", "Checking for updates...");
		Mustache.parse(template);
		$.ajax({
			dataType: "json",
			cache: false,
			url: "/service/tweets.php"
			//url: "/service/tweets_debug.json"
		}).done(function(data) {
			var $tweetstream = $(".js-tweetstream"),
			    rendered = "";
			$.each(data.tweets, function(index, tweet) {
				if($.inArray(tweet.id, bb.tweetstream.loadedTweets) <= -1) {
					bb.tweetstream.loadedTweets.push(tweet.id);
					rendered += Mustache.render(template, tweet);
					bb.log("Tweetstream", "Tweets inserted!");
				}
				else {
					bb.log("Tweetstream", "No more tweets to speak of.");
					return false;
				}
			});
			$tweetstream.prepend($(rendered).hide().fadeIn());
			$tweetstream.children().each(function(index, element) {
				var $element = $(element);
				if(index > 9) { // max out at 5
					$element.fadeOut(500, function() { $element.remove(); });
				}
				else {
					$element.find("[data-timeago]").timeago();
				}
			});
		}).fail(function() {
			bb.log("Tweetstream", "Loading failed.");
		});
	}
};

bb.schedule = {
	lastTimestamp: 0000000000,
	init: function() {
		bb.schedule.update();
		setInterval(bb.schedule.update, 62000); // 62 seconds
	},
	update: function() {
		var template = $("#tmpl-schedule").html(),
		    timeNow = Math.round(new Date().getTime()/1000);
		bb.log("Schedule", "Checking for updates...");
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
						var rendered = Mustache.render(template, event);
						$(".js-schedule-placeholder")
							.fadeOut(function() {
								$(this).html(rendered).fadeIn()
							});
						bb.log("Schedule", "Event updated!");
						return false;
					}
					else {
						bb.log("Schedule", "Event doesn't need updating.");
						return false;
					}
				}
			});
		}).fail(function() {
			bb.log("Schedule", "Loading failed.");
		});
	}
};

$(document).ready(function() {
	bb.schedule.init();
	bb.tweetstream.init();
	bb.stream.init();
});

// Handy documentation
var help = function() {
	bb.log("bb.stream.url(url)", "Navigate to a custom stream URL or enter a keyword.", "#0000cc");
	bb.log("	hello", "Welcome message.", "#0000cc");
	bb.log("	goodbye", "Goodbye message.", "#0000cc");
	bb.log("	quiz", "Quiz question slides.", "#0000cc");
	bb.log("	quiza", "Quiz answer slides.", "#0000cc");
	bb.log("	ponydrome", "Ponydrome playlist (YouTube).", "#0000cc");
	bb.log("bb.stream.toggle()", "Expand/collapse streamer (shows more tweets).", "#0000cc");
	bb.log("bb.tweetstream.update()", "Force update tweetstream.", "#0000cc");
	bb.log("bb.schedule.update()", "Force update schedule.", "#0000cc");
};