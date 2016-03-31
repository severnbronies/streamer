var app = app || {};

app.requests = function() {
	var self = this;
	var resultTemplate;
	this.init = function() {
		resultTemplate = $("#tmpl-video").html();
		Mustache.parse(resultTemplate);
		self.bindEvents();
	};
	this.bindEvents = function() {
		$(document).on("submit", "#search", function(e) {
			e.preventDefault();
			var $this = $(this);
			var query = $this.find("[name='search']").val();
			var service = $this.find("[name='service']").val();
			$("#results").empty();
			switch(service) {
				case "youtube":
					self.searchYouTube(query);
					break;
				case "soundcloud":
					self.searchSoundcloud(query);
					break;
			}
		});
		$(document).on("click", ".submitRequest", function(e) {
			e.preventDefault();
			var $this = $(this);
			$.getJSON("/request", {
				type: $this.attr("data-type"),
				id: $this.attr("data-id"),
				title: $this.attr("data-title"),
				description: $this.attr("data-description"),
				thumbnail: $this.attr("data-thumbnail")
			}, function(data) {
				if(data.added) {
					$this.text("Added to playlist");
				}
				else {
					$this.text("ERROR: " + data.error);
				}
				$this.prop("disabled", true);
			});
		});
	};
	this.addSearchResults = function(items, cbNextPage) {
		$.each(items, function(i, video) {
			var result = $("<li/>").html(Mustache.render(resultTemplate, video));
			$("#results").append(result);
		});
		$("#more").off("click").on("click", cbNextPage);
	};
	this.searchYouTube = function(query, pageToken) {
		var API_KEY = "AIzaSyDg5EAtlN6aAHNmvcA53iBGPe0Mx0OzvqA";
		var API_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";
		var params = {
			q: query,
			pageToken: pageToken,
			part: "snippet",
			key: API_KEY,
			maxResults: 20,
			type: "video"
		};
		$.getJSON(API_ENDPOINT, params, function(data) {
			var items = $.map(data.items, function(result) {
				return {
					title: result.snippet.title,
					thumbnail: result.snippet.thumbnails.default.url,
					description: result.snippet.description,
					id: result.id.videoId,
					type: "youtube"
				}
			});
			self.addSearchResults(items, function() {
				self.searchYouTube(query, data.nextPageToken)
			});
		});
	};
	this.searchSoundcloud = function(query, offset) {
		var API_KEY = "fbab4fa264979594df9f5cda9fd1fa3d";
		var API_ENDPOINT = "https://api.soundcloud.com/tracks";
		offset = (typeof offset != "undefined") ? offset : 0;
		var params = {
			q: query,
			offset: offset,
			client_id: API_KEY
		};
		$.getJSON(API_ENDPOINT, params, function(data) {
			var items = $.map(data, function(result) {
				return {
					title: result.title,
					thumbnail: result.artwork_url,
					description: result.description,
					id: result.id,
					type: "soundcloud"
				}
			});
			self.addSearchResults(items, function() {
				self.searchSoundcloud(query, (offset + items.length));
			});
		});
	};
};