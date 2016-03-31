var app = app || {};

app.ui = {
	timeAgo: function() {
		jQuery.timeago.settings.allowFuture = true;
		setInterval(function() {
			$("[data-timeago]").timeago();
		}, 1000);
	}
};