class AuthenticationsController < ApplicationController
  
  layout 'application'

  def failure
    redirect_to "/"
  end

  def create
    omniauth = request.env["omniauth.auth"]
    user = User.find_by_provider_and_uid(omniauth['provider'], omniauth['uid'])

    if user
      user.set_access_token(omniauth) if omniauth['provider'] == 'facebook'
      user.save
      session[:user_id] = user.id
      redirect_to "/site/index"
    else
      user = User.find_by_email(omniauth['info']['email']) || User.new
      user.apply_omniauth(omniauth)
      if user.save
        cookies[:already_signed_in_once] = true
        user.provider = omniauth['provider']
        user.uid = omniauth['uid']
        user.set_access_token(omniauth) if omniauth['provider'] == 'facebook'
        user.save
        session[:user_id] = user.id
        redirect_to "/site/index"
      end
    end
  end

end