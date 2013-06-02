class User < ActiveRecord::Base
  attr_accessible :name, :provider, :uid, :email, :image, :nickname, :first_name, :last_name, :location, :description, :phone, :urls, :token, :token_expires_at

  def apply_omniauth(omniauth)
    self.name = omniauth["info"]["name"] if name.blank?
    self.image = omniauth["info"]["image"] if image.blank?
    self.email = omniauth["info"]["email"] if email.blank?
    self.nickname = omniauth["info"]["nickname"] if nickname.blank?
    self.first_name = omniauth["info"]["first_name"] if first_name.blank?
    self.last_name = omniauth["info"]["last_name"] if last_name.blank?
    self.location = omniauth["info"]["location"] if location.blank?
    self.description = omniauth["info"]["description"] if description.blank?
    self.phone = omniauth["info"]["phone"] if phone.blank?
    self.urls = omniauth["info"]["urls"] if urls.blank?
  end


    def set_access_token(omniauth)
      self.token = omniauth['credentials']['token']
      self.token_expires_at = omniauth['credentials']['expires_at']
    end
  
end
