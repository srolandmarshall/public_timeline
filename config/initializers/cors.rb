Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*'
    resource '*',
             headers: :any,
             methods: %i[get post delete put patch options head]
  end
end

Rails.application.config.hosts << 'http://localhost:3000/'
Rails.application.config.hosts <<
  'https://api.twitter.com/2/tweets/sample/stream'

puts Rails.application.config.hosts
