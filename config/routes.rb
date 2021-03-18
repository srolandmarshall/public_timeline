Rails
  .application
  .routes
  .draw do
    get 'home/index'

    # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

    root to: 'home#index'
    get '/test', to: 'home#test'
    get '/via_js', to: 'home#js'
  end
