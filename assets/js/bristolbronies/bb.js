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
	loadedTweets: [],
	init: function() {
		bb.tweetstream.checkForUpdate();
		setInterval(bb.tweetstream.checkForUpdate, 30000); // 30 seconds
	},
	checkForUpdate: function() {
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
			$tweetstream.prepend(rendered);
			$tweetstream.children().each(function(index, element) {
				if(index <= 4) {
					$(element).find("[data-timeago]").timeago();
				}
				if(index > 4) { // max out at 5
					$(element).remove();
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
});