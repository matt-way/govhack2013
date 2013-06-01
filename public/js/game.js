function Game(_url){

	this.data_ = null;
	var that = this;
	$.ajax({
        url: _url,
        success: function(result) {
       		that.data_ = result;
        },
        async: false
    });
};

Game.prototype.getData = function(){
	return this.data_;
}

Game.prototype.load = function(_overlay) {

var products = this.data_['products'];

	for(var i=0;i<products.length;i++){
		var locs = products[i]['nearestLocation'].split(',');
		var loc = _overlay.MapPoint(locs[0], locs[1]);

		var myLatlng = new google.maps.LatLng(locs[0],locs[1]);

		var marker = new google.maps.Marker({
      		position: myLatlng,
      		map: _overlay.map_,
      		title:"Hello World!"
  		});
	}
	
	var stage = _overlay.getStage();
	var layer = new Kinetic.Layer();
	stage.add(layer);	

	var products = this.data_['products'];
	for(var i=0;i<products.length;i++){

		var locs = products[i]['nearestLocation'].split(',');
		var loc = _overlay.MapPoint(locs[0], locs[1]);

		var point = new Kinetic.Circle({
				x: loc.x,
				y: loc.y,
				radius: 0.002,
				fill: '#AA0000', 
				opacity: 0.5         
			});
			layer.add(point);	

		var myLatlng = new google.maps.LatLng(locs[0], locs[1]);
		var marker = new google.maps.Marker({
      		position: myLatlng,
      		map: this.map_,
      		title:"Hello World!"
  		});	
	}

/*
			point.setListening(true);

    point.on("click",function(evt){
      console.log('hello');
      //myRect = stage.getChildren()[i];
    });
*/
}