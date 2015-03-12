<?php
	require("../config.php");
	require("../libs/TwitterAPIExchange.class.php");
	
	// Settings
	$settings = array(
		"oauth_access_token" => OAUTH_KEY,
		"oauth_access_token_secret" => OAUTH_SECRET,
		"consumer_key" => CONSUMER_KEY,
		"consumer_secret" => CONSUMER_SECRET
	);
	$url = "https://api.twitter.com/1.1/search/tweets.json";
	$options = "?q=from%3Abristolbronies%20OR%20%40bristolbronies%20OR%20%23bbs5";
	$method = "GET";

	// The actual API call
	$twitter = new TwitterAPIExchange($settings);
	$data = json_decode($twitter->setGetfield($options)->buildOauth($url, $method)->performRequest());

	// print_r($data); exit;

	// Output
	$output = "";
	foreach($data->statuses as $status) {
		if($status->retweeted_status === null) { 
			$output[] = array(
				"id" => $status->id_str,
				"time" => date("c", strtotime($status->created_at)),
				"user" => $status->user->screen_name,
				"avatar" => $status->user->profile_image_url,
				"content" => $status->text
			);
		}
	}
	$output = array("tweets" => $output);
	header("Content-Type: application/json");
	echo json_encode($output);