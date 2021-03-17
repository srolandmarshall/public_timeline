class HomeController < ApplicationController
  def index
    @tweets = []
    TweetStream::Client.new.sample do |status, client|
      @tweets << status
      client.stop if @tweets.size >= 20
    end
  end

  def test
    @tweets = []
    TweetStream::Client.new.sample do |status, client|
      @tweets << status
      client.stop if @tweets.size >= 20
    end
    binding.pry
  end
end
