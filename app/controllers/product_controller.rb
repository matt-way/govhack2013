class ProductController < ApplicationController
  respond_to :json

  def index
    
    @lat = params[:lat]||"-27.477512"
    @long = params[:lng]||"153.029324"

    url = "http://govhack.atdw.com.au/productsearchservice.svc/products?key=278965474541&latlong=#{@lat},#{@long}&dist=5&facets=cats&pge=1&size=1000&out=json"
    content, redirect_url, headers  = CachedWeb.get(:url=>url)
    @ret = JSON.parse(content)
    @products = @ret["products"]
    
    respond_with @ret
  end
end