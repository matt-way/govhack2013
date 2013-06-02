Govhack2013::Application.routes.draw do
  get "site/index"

  scope "api" do
    resources :product
  end

   # Authentication
  match "/auth/failure" => "authentications#failure"
  match "/auth/:provider/callback" => "authentications#create"
 
  root :to => 'site#welcome'
end
