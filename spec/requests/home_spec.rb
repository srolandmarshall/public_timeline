require 'rails_helper'

RSpec.describe 'Home Page', type: :request do
  it 'loads the index page' do
    get '/'
    expect(response).to render_template(:index)
  end
end
RSpec.describe 'Home Page', type: :feature do
  scenario 'Expect the homepage to load a list of tweets' do
    visit '/'
    expect(page).to have_selector(:id, 'tweets')
  end
  scenario 'Expect there to be at least one tweet' do
    visit '/'
    expect(page).to have_selector('div.tweet')
  end
  scenario 'Expect there to be 20 tweets' do
    visit '/'
    expect(page).to have_selector('div.tweet', count: 20)
  end
end
