/****


****/

function KineticGMapOverlay(map, readyFunc) {
  // the google map object
  this.map_ = map;

  // the div that will hold the kinetic stage
  this.container_ = null;

  // the kinetic stage
  this.stage_ = null;

  this.isAdded_ = false;

  this.clickHandler_ = null;

  this.topLeft_ = null;
  
  this.setMap(map);

  // function called for user to tell them that the stage is ready for use
  this.ready_ = readyFunc;

  // setup event callback routing
  function simpleBindShim(thisArg, func) {
    return function() { func.apply(thisArg); };
  }
  this.resizeFunction_ = simpleBindShim(this, this.resizeEvent_);
  this.repositionFunction_ = simpleBindShim(this, this.repositionEvent_); 
  this.clickFunction_ = simpleBindShim(this, this.clickEvent_);
}

// inheriting from google maps overlay
KineticGMapOverlay.prototype = new google.maps.OverlayView();

// stage retrieval
KineticGMapOverlay.prototype.getStage = function() {
  return this.stage_;
}

/*
google.maps.event.addListener(map, 'idle', function() {
   // Get projection
   projection = overlay.getProjection();
})
*/

// Get correct points by doing a lat/long conversion
KineticGMapOverlay.prototype.MapPoint = function(_x, _y){
  var latlong = new google.maps.LatLng(_x, _y);
  var mapProjection = this.map_.getProjection();
  var worldPoint = mapProjection.fromLatLngToPoint(latlong);
  return new google.maps.Point(worldPoint.x, worldPoint.y);
  //return new google.maps.Point(worldPoint.x, worldPoint.y+0.27);  
}

/**
 * Transform CSS property name, with vendor prefix if required. If browser
 * does not support transforms, property will be ignored.
 * @type {string}
 * @const
 * @private
 */
 KineticGMapOverlay.CSS_TRANSFORM_ = (function() {
  var div = document.createElement('div');
  var transformProps = [
  'transform',
  'WebkitTransform',
  'MozTransform',
  'OTransform',
  'msTransform'
  ];
  for (var i = 0; i < transformProps.length; i++) {
    var prop = transformProps[i];
    if (div.style[prop] !== undefined) {
      return prop;
    }
  }

  // return unprefixed version by default
  return transformProps[0];
})();

// required implementation for custom gmap overlay
KineticGMapOverlay.prototype.onAdd = function() {

  // Note: an overlay's receipt of onAdd() indicates that
  // the map's panes are now available for attaching
  // the overlay to the map via the DOM.

  // Create the DIV and set some basic attributes.
  var div = document.createElement('div');
  div.style.border = "none";
  div.style.borderWidth = "0px";
  div.style.position = "absolute";

  // Set the overlay's div_ property to this DIV
  this.container_ = div;

  // calculate canvas size
  var mwidth = this.map_.getDiv().offsetWidth;
  var mheight = this.map_.getDiv().offsetHeight;

  // create the stage 
  var stage = new Kinetic.Stage({
    container: div,  
    width: mwidth,
    height: mheight
  });
  this.stage_ = stage;

  // We add an overlay to a map via one of the map's panes.
  // We'll add this overlay to the overlayImage pane.
  var panes = this.getPanes();
  //panes.overlayLayer.appendChild(div);
  panes.overlayLayer.appendChild(div);

  // hook the map events
  google.maps.event.addListener(this.map_, 'resize', this.resizeFunction_);
  google.maps.event.addListener(this.map_, 'center_changed', this.repositionFunction_);  
  google.maps.event.addListener(this.map_, 'click', this.clickFunction_);  

  // call the user given function to say everything has been added
  if(this.ready_){
    this.ready_();
  }

  this.isAdded_ = true;
}

KineticGMapOverlay.prototype.resizeEvent_ = function() {
  if(this.isAdded_){
    this.resize_();
  }
}

KineticGMapOverlay.prototype.repositionEvent_ = function() {
  this.reposition_();
}

KineticGMapOverlay.prototype.clickEvent_ = function(evt) {
  console.log(evt);
  if(this.clickHandler_){
    this.clickHandler_();
  }
}

KineticGMapOverlay.prototype.setClickHandler = function(_handler) {
  this.clickHandler_ = _handler;
}

// attempt to retrieve the canvas object
KineticGMapOverlay.prototype.getCanvas_ = function() {
  if(this.canvas_){
    return this.canvas_;
  }
  var layers = this.stage_.getLayers();
  if(layers.length > 0){
    this.canvas_ = layers[0].getCanvas();
    return this.canvas_;
  }
  return null;
}

KineticGMapOverlay.prototype.resize_ = function() {

  var canvas = this.getCanvas_();
  if(!canvas){
    return;
  }

  canvas = canvas.getElement();

  var width = this.map_.getDiv().offsetWidth;
  var height = this.map_.getDiv().offsetHeight;
  var oldWidth = canvas.width;
  var oldHeight = canvas.height;

  // resizing may allocate a new back buffer, so do so conservatively
  if (oldWidth !== width || oldHeight !== height) {
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    this.draw();    
  }
}

KineticGMapOverlay.prototype.reposition_ = function () {
  this.draw();
}

// called when gmaps has posted a redraw
KineticGMapOverlay.prototype.draw = function() {
  var canvas = this.getCanvas_();
  if(!canvas){
    return;
  }

  // Size and position the overlay. We use a southwest and northeast
  // position of the overlay to peg it to the correct position and size.
  // We need to retrieve the projection from this overlay to do this.
  var canvas = this.getCanvas_();
  if(!canvas){
    return;
  }

  var bounds = this.getMap().getBounds();
  this.topLeft_ = new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng());

  var projection = this.getProjection();
  var divTopLeft = projection.fromLatLngToDivPixel(this.topLeft_);  
  //canvas.getElement().style[KineticGMapOverlay.CSS_TRANSFORM_] = 'translate(' + Math.round(divTopLeft.x) + 'px,' + Math.round(divTopLeft.y) + 'px)';  
  var $can = $(canvas.getElement());
  //transform: translate(50px,100px);
//-ms-transform: translate(50px,100px); /* IE 9 */
//-webkit-transform: translate(50px,100px); /* Safari and Chrome */
  var trans = 'translate(' + Math.round(divTopLeft.x) + 'px,' + Math.round(divTopLeft.y) + 'px)';
  $can.css('transform', trans);
  $can.css('-ms-transform', trans);
  $can.css('-webkit-transform', trans);
  
  // update the canvas so match the map offsets + zoom
  var context = canvas.getContext();  
  context.setTransform(1, 0, 0, 1, 0, 0);

  var scale = Math.pow(2, this.map_.zoom);
  context.scale(scale, scale);
  
  var mapProjection = this.map_.getProjection();
  var offset = mapProjection.fromLatLngToPoint(this.topLeft_);
  context.translate(-offset.x, -offset.y);

  // finally draw everything on the stage
  this.stage_.draw();
}

KineticGMapOverlay.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;

  // TODO: should remove listeners/callbacks
}