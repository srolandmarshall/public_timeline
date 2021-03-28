const needle = require("needle");
const proxy = "http://localhost:8080/";
import * as timeago from "timeago.js";

const request = require("request");

const token = process.env.BEARER_TOKEN;

console.log(token);

const streamURL =
	"https://api.twitter.com/2/tweets/sample/stream?tweet.fields=created_at,source&expansions=author_id&user.fields=url,profile_image_url,username,name";

const fetchURL = proxy + streamURL;
var tweetsData = [];
var count = 1;

function handleJSON(json) {
	const { data, includes } = json;
	const tweet = data;
	const user = includes.users[0];
	if (count <= 20) {
		tweetsData.push(createTweet(tweet, user));
		count += 1;
	}
	// once the count is 20, modify the dome
	count >= 20 ? displayTweets(tweetsData) : displayLoading();
}

function displayTweets(data) {
	$("#tweets").html("");
	data.forEach((tweet) => {
		$("#tweets").append(tweet);
	});
}

function displayLoading() {
	$("#tweets").html(`<H3>Loading...</H3>`);
}

function handleError(error) {
	$("#tweets").html(`<h3>${error}</h3>`);
}

function streamConnect(retryAttempt) {
	const stream = needle.get(fetchURL, {
		headers: {
			"User-Agent": "v2SampleStreamJS",
			Authorization: `Bearer ${token}`,
		},
		timeout: 20000,
	});

	var count = 0;
	stream
		.on("data", (data) => {
			try {
				const json = JSON.parse(data);
				count += 1;
				console.log(json);
				handleJSON(json);
				// A successful connection resets retry count.
				retryAttempt = 0;
			} catch (e) {
				// Catches error in case of 401 unauthorized error status.
				if (data.status >= 400) {
					console.log(data);
					handleError(data.detail);
					process.exit(1);
				} else if (data.status === 429) {
					handleError(data.detail);
					process.exit(1);
				} else {
					// Keep alive signal received. Do nothing.
				}
			}
		})
		.on("done", (error) => {
			if (error.code !== "ECONNRESET") {
				console.log(error.message);
				handleError(error.code);
				process.exit(1);
			} else {
				// This reconnection logic will attempt to reconnect when a disconnection is detected.
				// To avoid rate limits, this logic implements exponential backoff, so the wait time
				// will increase if the client cannot reconnect to the stream.
				setTimeout(() => {
					console.warn("A connection error occurred. Reconnecting...");
					streamConnect(++retryAttempt);
				}, 2 ** retryAttempt);
			}
		});
	return stream;
}

(async () => {
	streamConnect(0);
})();

function createTweetBody(tweet, user) {
	return `<p>
        <strong>${user.name}</strong>
        <a href="${user.url}%>">@${user.username}</a>
      </p>

      <p>${tweet.text}</p>
      <p>
       ${timeago.format(tweet.created_at)} from
        ${tweet.source}
      </p>
      `;
}

function createTweet(tweet, user) {
	// Create div
	const tweetDiv = document.createElement("div");
	tweetDiv.classList.add("tweet");
	$(tweetDiv).attr("id", tweet.id);

	// Add container wrapper for tweet
	const tweetContainer = document.createElement("div");
	tweetContainer.classList.add("container");
	tweetDiv.appendChild(tweetContainer);

	//add profile image to tweet body
	const profileImage = document.createElement("div");
	profileImage.classList.add("profileimage");

	//add tweet text and teaftures
	const tweetBody = document.createElement("div");
	tweetBody.classList.add("tweetbody");
	tweetContainer.appendChild(profileImage);
	$(profileImage).append(`<img src=${user.profile_image_url}>`);
	tweetContainer.appendChild(tweetBody);

	$(tweetBody).append(createTweetBody(tweet, user));
	return tweetDiv;
}

$(function () {
	timeago.render(document.querySelectorAll(".need_to_be_rendered"));
});
