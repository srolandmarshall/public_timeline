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
    $("#tweets").append(createTweet(tweet, user));
    count += 1;
  }
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
        if (data.status === 401) {
          console.log(data);
          process.exit(1);
        } else if (
          data.detail ===
          "This stream is currently at the maximum allowed connection limit."
        ) {
          console.log(data.detail);
          process.exit(1);
        } else {
          // Keep alive signal received. Do nothing.
        }
      }
    })
    .on("err", (error) => {
      if (error.code !== "ECONNRESET") {
        console.log(error.code);
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
  console.log(tweetsData);
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
  const tweetDiv = document.createElement("div");
  tweetDiv.classList.add("tweet");
  $(tweetDiv).attr("id", tweet.id);
  const tweetContainer = document.createElement("div");
  tweetContainer.classList.add("container");
  tweetDiv.appendChild(tweetContainer);
  const profileImage = document.createElement("div");
  profileImage.classList.add("profileimage");
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
