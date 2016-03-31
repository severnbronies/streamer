// Rename to config.js when in use

module.exports = {
	port: 9001,
	adminPassword: "broniesYo",
	twitterSearchArchive: "\"severn bronies\" OR severnbronies OR 6severn",
	twitterSearchLive: "severn bronies,severnbronies,6severn",
	twitterId: 730239216, // @severnbronies
	twitterAccessKey: "YOUR ACCESS KEY HERE",
	twitterAccessSecret: "YOUR ACCESS SECRET HERE",
	twitterConsumerKey: "YOUR CONSUMER KEY HERE",
	twitterConsumerSecret: "YOUR CONSUMER SECRET HERE",
	schedule: [
		{"timestamp": "2016-09-22T11:00:00+01:00", "event": "Go to the moon"},
		{"timestamp": "2016-09-22T11:30:00+01:00", "event": "Come back from the moon"}
	]
};
