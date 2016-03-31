var app = app || {};

app.twitter = function() {
	var self = this;
	var $tweetstream;
	var tweetTemplate;
	this.init = function() {
		$tweetstream = $("[data-tweets-list]");
		tweetTemplate = $("#tmpl-tweet").html();
		Mustache.parse(tweetTemplate);
	};
	this.update = function(tweet) {
		var rendered = Mustache.render(tweetTemplate, tweet);
		$tweetstream.prepend($(rendered).hide().fadeIn());
		$tweetstream.children().each(function(index, element) {
			var $element = $(element);
			if(index >= 14) { 
				$element.fadeOut(500, function() { $element.remove(); });
			}
		});
	};
	// this.tweetReminder = function() {
	// 	setInterval(function() {
			
	// 	}, 1000 * 60 * 10); // 10 minutes
	// }
};