class SiteController < ApplicationController
  def index

    @lat = -27
    @long = 153
    url = "http://govhack.atdw.com.au/productsearchservice.svc/products?key=278965474541&latlong=#{@lat},#{@long}&dist=50&out=json"
    content, redirect_url, headers  = CachedWeb.get(:url=>url)
    @ret = JSON.parse(content)
    @products = @ret["products"]

  end
end
