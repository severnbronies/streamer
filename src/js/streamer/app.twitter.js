var app = app || {};

app.twitter = function() {
	var self = this;
	var $tweetstream;
	var tweetTemplate;
	this.init = function() {
		$tweetstream = $("[data-tweets-list]");
		tweetTemplate = $("#tmpl-tweet").html();
		Mustache.parse(tweetTemplate);
		setTimeout(self.tweetReminder, 5000);
		setInterval(self.tweetReminder, 1000 * 60 * 20); // 20 minutes
	};
	this.update = function(tweet) {
		tweet.text = tweet.text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="stream">$1</a>');
		tweet.text = tweet.text.replace(/(^|\W)(#[a-z\d][\w-]*)/ig, '$1<a href="https://twitter.com/search?q=$2" target="stream">$2</a>');
		tweet.text = tweet.text.replace(/(^|\W)(@[a-z\d][\w-]*)/ig, '$1<a href="https://twitter.com/$2" target="stream">$2</a>');
		var rendered = Mustache.render(tweetTemplate, tweet);
		$tweetstream.prepend($(rendered).hide().fadeIn(1000).css({ "display": "inline-block" }));
		// $tweetstream.children().each(function(index, element) {
		// 	var $element = $(element);
		// 	if(index >= 14) { 
		// 		$element.fadeOut(1000, function() { $element.remove(); });
		// 	}
		// });
	};
	this.tweetReminder = function() {
		var tweetReminder = {
			automated: true,
			created_at: new Date().toISOString(),
			text: "Any tweets mentioning @SevernBronies or containing the hashtag #SBSeason9 will appear here. Go on! Tweet! Do it now!",
			user: {
				screen_name: "SevernBronies"
			}
		};
		self.update(tweetReminder);
	}
};