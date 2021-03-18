require 'rails_helper'

RSpec.describe 'Home Page', type: :request do
  it 'loads the index page' do
    get '/'
    expect(response).to render_template(:index)
  end
end

RSpec.describe 'JS Page', type: :request do
  it 'loads the js page' do
    get '/via_js'
    expect(response).to render_template(:js)
  end
end
