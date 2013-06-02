var ItemPoint = function(_game, _product, _details) {
	this.game_ = _game;

	this.raw_ = _product;
	this.name_ = _product['productName'];
	this.img_ = _product['productImage'];
	this.desc_ = _product['productDescription'];

	this.radius_ = _details.radius;

	this.colour_ = _details.catinfo['colour'];
	this.colourVal_ = _details.catinfo['colourVal'];

	this.icon_ = _details.catinfo['icon'];

	this.visible_ = true;

	this.marker_ = null;
	this.circle_ = null;
	
	this.latlong_ = new google.maps.LatLng(_details.lat, _details.lng);
	this.loc_ = null;		
}

ItemPoint.prototype.init = function(_overlay, _layer) {

	this.loc_ = _overlay.MapPoint(this.latlong_.lat(), this.latlong_.lng());

	this.marker_ = new google.maps.Marker({
      		position: this.latlong_,
      		map: _overlay.map_,
      		title: this.title_,
      		visible: false,
      		icon: this.icon_
  	});
	
  	this.circle_ = new Kinetic.Circle({
		x: this.loc_.x,
		y: this.loc_.y,
		radius: this.radius_,
		fill: this.colourVal_, 
		opacity: 0.2,
		stroke: this.colourVal_,
		strokeWidth: 0.0005,
		visible: false        
	});
	_layer.add(this.circle_);	

	this.marker_.set('mContent', this);
	// handle clicking on marker
	google.maps.event.addListener(this.marker_, 'click', function(evt){
		// show the detail info, except if the marker has already been chosen, do show the add button
		var mContent = this.get('mContent');

		var contString = '<div id="pname">' + mContent.name_ + '</div>' +
						 '<img height="100" src="' + mContent.img_ + '"/>' +
						 '<div id="pdesc">' + mContent.desc_ + '</div>';
		if(!mContent.chosen_){					
			contString += '<div id="pchoose" class="btn">Choose</div>';
		}
		mContent.game_.infoWindow_.setContent(contString);		
		mContent.game_.infoWindow_.open(_overlay.map_, this);
	});
}

ItemPoint.prototype.showCircle = function(){
	this.circle_.show();
}
ItemPoint.prototype.showMarker = function(){
	this.marker_.setVisible(true);
}
ItemPoint.prototype.hideCircle = function(){
	this.circle_.hide();
}
ItemPoint.prototype.hideMarker = function(){
	this.marker_.setVisible(false);
}

ItemPoint.prototype.setColour = function(_colour){
	
}

ItemPoint.prototype.setRadius = function(_radius){
	this.circle_.setAttr('radius', _radius);	
}

// Game class
function Game(_url){

this.catInfo_ = {
	'RESTAURANT' : {
		'colour' : 'red',
		'colourVal' : '#FF0000',
		'icon' : 'http://maps.google.com/intl/en_us/mapfiles/ms/micons/red.png',
	},
	'ATTRACTION' : {
		'colour' : 'green',
		'colourVal' : '#00FF00',
		'icon' : 'http://maps.google.com/intl/en_us/mapfiles/ms/micons/green.png',
	},
	'ACCOM' : {
		'colour' : 'blue',
		'colourVal' : '#0000FF',		
		'icon' : 'http://maps.google.com/intl/en_us/mapfiles/ms/micons/blue.png',
	},
	'EVENT' : {
		'colour' : 'purple',
		'colourVal' : '#9000ff',
		'icon' : 'http://maps.google.com/intl/en_us/mapfiles/ms/micons/purple.png',
	},
	'TOUR' : {
		'colour' : 'orange',
		'colourVal' : '#ffa800',
		'icon' : 'http://maps.google.com/intl/en_us/mapfiles/ms/micons/orange.png',
	},
	'JOURNEY' : {
		'colour' : 'yellow',
		'colourVal' : '#FFFF00',
		'icon' : 'http://maps.google.com/intl/en_us/mapfiles/ms/micons/yellow.png',
	},
	/*'HIRE' : {

	},
	
	'INFO' : {

	},
	'DESTINFO' : {

	},
	'TRANSPORT' : {

	}*/
};

	this.curSelection_ = null;
	this.stage_ = null;

	this.data_ = null;
	var that = this;
	$.ajax({
        url: _url,
        success: function(result) {
       		that.data_ = result;
        },
        async: false
    });

    this.markerList_ = [];
    this.layers_ = [];

    this.infoWindow_ = new google.maps.InfoWindow({
			content: ''
		});

    // go through the data and setup the points/layers/etc
    var products = this.data_['products'];
	for(var i=0;i<products.length;i++){

		var locs = products[i]['nearestLocation'].split(',');		

		var info = this.catInfo_[products[i]['productCategoryId']];
		if(info){

			var point = new ItemPoint(this, products[i],
				{ lat: locs[0], lng: locs[1],
				  catinfo: info,
				  radius: 0.007,
				});

			// add to the correct layer
			if(!(products[i]['productCategoryId'] in this.layers_)){
				this.layers_['productCategoryId'] = [];
			}
			this.layers_['productCategoryId'].push(point);	
		
			// add to global list
			this.markerList_.push(point);			
		}
	}
};

Game.prototype.getData = function(){
	return this.data_;
}

Game.prototype.load = function(_overlay) {

	this.stage_ = _overlay.getStage();
	var layer = new Kinetic.Layer();
	this.stage_.add(layer);

	for(var i=0;i<this.markerList_.length;i++){
		this.markerList_[i].init(_overlay, layer);
		if(i==0){
			this.markerList_[i].showMarker();
			this.markerList_[i].showCircle();
			this.curSelection_ = this.markerList_[i];
		}		
	}
}

Game.prototype.sliderChanged = function(_value){
	if(!this.curSelection_){
		return;
	}

	this.curSelection_.setRadius(_value);

	// need to calculate which points to show within the radius
	// get position and radius information
	var pos = this.curSelection_.latlong_;	
	
	for(var i=0;i<this.markerList_.length;i++){

		var target = this.markerList_[i].latlong_;

		var dist = google.maps.geometry.spherical.computeDistanceBetween(pos, target);
		
		if(dist < _value * 10000){
			this.markerList_[i].showMarker();
		}else{
			this.markerList_[i].hideMarker();
		}				
	}

	this.stage_.draw();
}