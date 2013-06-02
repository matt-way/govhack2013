class SiteController < ApplicationController
  def index

    if params[:address].present?
      @center = Geocoder.coordinates(params[:address])
    elsif params[:lng].present? and params[:lat].present?
      @center = [params[:lat], params[:lng]]
    else
      @center = [-27, 153]
    end


    @lat = @center[0]
    @long = @center[0]
    url = "http://govhack.atdw.com.au/productsearchservice.svc/products?key=278965474541&latlong=#{@lat},#{@long}&dist=50&out=json"
    content, redirect_url, headers  = CachedWeb.get(:url=>url)
    @ret = JSON.parse(content)
    @products = @ret["products"]

  end

  def categories

    url = "http://govhack.atdw.com.au/productsearchservice.svc/categories?key=278965474541&out=json"
    content, redirect_url, headers  = CachedWeb.get(:url=>url)
    @ret = JSON.parse(content)
  end

  def privacy
  end

  def types

    url = "http://govhack.atdw.com.au/productsearchservice.svc/producttypes?key=278965474541&cats=ACCOMM,EVENT,ATTRACTION"
    
  end
end
