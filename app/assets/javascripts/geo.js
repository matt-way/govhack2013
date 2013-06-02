var map;
var pMap;
var panorama;
var latitude;
var longitude;
var infowindow = new google.maps.InfoWindow({});
var returnData = [];
var markerList=[];
var infoBoxes=[];


$(document).ready(function(){
    getLocation();
    $('#showPos').click(function(){
        MarkCurrPos("Title", "Scene", "Description", latitude, longitude, "");
       });
       
    $('#clearMap').click(function(){
      removeMarkers();
      });

    $('#close').click(function(){

      $('.onTop').fadeOut(100);
      $('#close').fadeOut(100);
    });
     
    /*$('#PostPhoto').onload(function(){
        photoTaken();
      });*/
      
    $('#PostPhoto').attr('onChange', 'photoTaken()');
    $('#showPhoto').click(function(){
      photoTaken();
      });
    $('#tourLink').click(function(){takeTour("", "");});

   //getLocs("300 summer St, Boston, MA", "","", "");
   
   $('body').delegate('#tourLink', 'click', function(e){
      $element = $(e.target);
      var lt = $element.attr('lat');
      var ln = $element.attr('lng');
      //console.log(ln + lt);
      takeTour(lt, ln);
      
    });
   $('body').delegate('#filmLink', 'click', function(e){
      $element = $(e.target);
      var title = $element.attr('title');
      //console.log(title);
      showMovie(title);
    });
    $('#street_view').hide();
    $('#close').hide();
  });

function initialize() {
        var mapOptions = {
          center: new google.maps.LatLng(latitude, longitude),
          zoom:15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map_canvas"),
            mapOptions);
        google.maps.event.addListener(map, 'dragend', function(){
          refreshMarkers();
          });
        getLocs("", "",latitude, longitude);
      }
      
function MarkCurrPos(title, scene, desc, lat, lng, id){
  //console.log("curre pos: lat: " + lat + " lng: " + lng);
  var description;
  if(!desc)
  {
    var description = "No Scene Description available. Feel free to upload one!";
  }
  else
  {
    description = desc;
  }
  var myPos = new google.maps.LatLng(lat, lng);
  var content = title;
  $popUpContent = $("<div></div>");
  $content = $("<div id='content' class='markerFlag'></div>");
  $footer = $("<div id='contentFooter'></div>");
  $bodyH = $("<body></body>");
  $htmlH = $("<html></html>");
  $content.append("<p><h2>" + title + ": " + scene + "</h2></p><p style='border-style:black 1px;'>" + description + "</p>");
  $footer.append('<div id="checkinLink" class="markerLink"><a href="/scenes/' +escape(id)+ '" target=_blank>Click for more details...</a></div>');
  //$footer.append("<div id='tourLink' class='markerLink' lat='"+ lat + "' lng='" + lng + "'>tour!</div>");
  /*$footer.append("<div id='filmLink' class='markerLink' title='" + title+ "'>Film Details</div>");
  $footer.append('<div id="checkinLink" class="markerLink"><a href="/checkins/upload?lat='+escape(lat) + '&lng='+escape(lng)+'&title=' + escape(title)+ '&scene=' + escape(scene) + '&desc=' + escape(desc)+ '" target=_blank>Check In!</a></div>');*/
  $content.append($footer.html());
/*
  $htmlH.append($content.html());
  $htmlH.append($footer.html());
  $bodyH.append($htmlH.html());*/
  $popUpContent.append($content);;
 // var marker;
  
  //var popUpContent = "<html><body><div><p><h2>" + title + ": " + scene + "</h2></p><p style='border-style:black 1px;'>" + desc + "</p></div><div class='tourLink' lat='"+ lat + "' lng='" + lng + "'>tour this scene!</div><div class='movieLink' title='" + title+ "'>Show Film Details</div></body></html>";

     var marker = new google.maps.Marker({
      position: myPos,
      map: map,
      title: title,
      infowindow: $popUpContent.html()
    })


    //console.log(marker.infowindow);
    //marker['infowindow']
  markerList.push(marker);

  var boxOptions= {
                 content: $popUpContent.html()
                ,disableAutoPan: false
                ,maxWidth: 0
                ,pixelOffset: new google.maps.Size(10, -140)
                ,zIndex: null
                ,boxStyle: { 
                  opacity: 0.82
                  ,width: "280px"
                 }
                ,closeBoxMargin: "10px 2px 2px 2px"
                ,closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif"
                ,infoBoxClearance: new google.maps.Size(1, 1)
                ,isHidden: false
                ,pane: "floatPane"
                ,enableEventPropagation: false

  };
  var infoBox = new InfoBox(boxOptions);
  infoBoxes.push(infoBox);
  
  google.maps.event.addListener(marker, 'click', function(){
    console.log(infoBoxes);
    for(var i=0; i<infoBoxes.length; i++)
    {
      console.log("hiding info box");
      var thisBox = infoBoxes[i];
      thisBox.close();
    }
    //console.log(infowindow);
    //infowindow.setContent(this['infowindow']);
    //infowindow.open(map, this);
    infoBox.open(map, marker);
    });
  }
  
  function getLocation() {
        // Get location no more than 10 minutes old. 600000 ms = 10 minutes.
    var latparam = $('.mapDiv').attr('lat');
    var lngparam = $('.mapDiv').attr('lng');
    if(!latparam || !lngparam)
    {
      navigator.geolocation.getCurrentPosition(foundLocation, noLocation, {enableHighAccuracy:true,maximumAge:600000});
    }
    else
    {
      latitude = latparam;
      longitude = lngparam;
      initialize();
    }

  }
  
  function foundLocation(position){
    //console.log("found position");
    if (!longitude || !latitude) {
      //console.log("need to initialize");
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      console.log("curre pos: lat: " + latitude + " lng: " + longitude);
      initialize();
    }
     latitude = position.coords.latitude;
     longitude = position.coords.longitude;
    //alert("curre pos: lat: " + lat + " lng: " + lng);

    }
  
  function noLocation(){
    alert("no location found");

    }
    

function getLocs(address, title, lat, lng){

  $.getJSON("/api/product.json?", {
      address:address,
      title: title,
      lat: lat,
      lng: lng
      }, function(data){
          $.each(data, function(key, val){
          $val = $(val);
          MarkCurrPos($val.attr('title'), $val.attr('scene'), $val.attr('description'), $val.attr('lat'), $val.attr('lng'), $val.attr('id'));
        });
      });
}

function refreshMarkers(){
  removeMarkers();
  var c = map.getCenter();
  getLocs("", "", c.lat(), c.lng());
  }
  
function removeMarkers(){
for(var i in infoBoxes)
{
  infoBoxes[i].setMap(null);
}
  for(var i in markerList)
  {//console.log(markerList[i].map);
    markerList[i].setMap(null);
  }
  markerList.length = 0;
  infoBoxes.length = 0;
}