require 'tweetstream'

Dotenv.require_keys('ACCESS_TOKEN', 'ACCESS_SECRET', 'API_KEY', 'API_SECRET')

module TweetstreamHelper
  TweetStream.configure do |config|
    config.consumer_key = ENV['API_KEY']
    config.consumer_secret = ENV['API_SECRET']
    config.oauth_token = ENV['ACCESS_TOKEN']
    config.oauth_token_secret = ENV['ACCESS_SECRET']
    config.auth_method = :oauth
  end
end
