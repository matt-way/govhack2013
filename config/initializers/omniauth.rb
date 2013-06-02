Rails.application.config.middleware.use OmniAuth::Builder do
  provider :facebook, '621694244508698', 'f0e01d613935fa93763b9c7be946a7c2'
  provider :google, '100215991152.apps.googleusercontent.com', '411IEq90_TIs-HO8HPnHxgW-'

end