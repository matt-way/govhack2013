class ProductController < ApplicationController
  respond_to :json

  def index
    
    @lat = params[:lat]
    @long = params[:lng]
    url = "http://govhack.atdw.com.au/productsearchservice.svc/products?key=278965474541&latlong=#{@lat},#{@long}&dist=50&out=json"
    content, redirect_url, headers  = CachedWeb.get(:url=>url)
    @ret = JSON.parse(content)
    @products = @ret["products"]
    
    respond_with @products
  end
end