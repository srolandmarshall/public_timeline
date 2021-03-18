const needle = require("needle");

const streamURL =
  "http://localhost:8080/https://api.twitter.com/2/tweets/sample/stream";
const token = process.env.BEARER_TOKEN;
var tweetsData = [];

console.log(`Bearer ${process.env.BEARER_TOKEN}`);

function streamConnect(retryAttempt) {
  const stream = needle.get(streamURL, {
    headers: {
      "User-Agent": "v2SampleStreamJS",
      Authorization: `Bearer ${token}`,
    },
    timeout: 20000,
  });

  stream
    .on("data", (data) => {
      try {
        const json = JSON.parse(data);
        tweetsData.push(json);
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
})();

function createTweet() {
  const tweetDiv = document.createElement("div");
  tweetDiv.classList.add("tweet");
  const tweetContainer = document.createElement("div");
  tweetContainer.classList.add("container");
  tweetDiv.appendChild(tweetContainer);
  const profileImage = document.createElement("div");
  profileImage.classList.add("profileimage");
  const tweetBody = document.createElement("div");
  tweetBody.classList.add("tweetbody");
  tweetContainer.appendChild(profileImage);
  tweetContainer.appendChild(tweetBody);
  return tweetDiv;
}

function tweetRange(start, num) {
  return tweetsData.slice(start, num - 1);
}

function firstTwentyTweets() {
  return tweetRange(0, 20);
}

const testTweet = {
  user: {
    name: "Sam Marshall",
    uri: "http://twitter.com",
    screenName: "dothefandango",
  },
  tweet: {
    fullText:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam porta lacus quis tortor suscipit fermentum. Etiam euismod ut eros vel.",
    createdAt: Date.now(),
    source: `<a href="http://twitter.com/download/iphone" rel="nofollow">Twitter for iPhone</a>`,
  },
};

console.log(firstTwentyTweets());
