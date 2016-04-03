$(document).ready(function() {
	function loadScript(src) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		document.getElementsByTagName("head")[0].appendChild(script);
		script.src = src;
	}
	
	function initMap() {
		var mapDiv = document.getElementById('map');
		var map = new google.maps.Map(mapDiv, {
		center: {lat: 48.85997285, lng: 2.3473104}, zoom: 15});

		var marker = new google.maps.Marker({
			position: {lat: 48.858321, lng: 2.345009},
			map: map,
			icon: 'img/home.png'
		});
	}

	//loadScript('https://maps.googleapis.com/maps/api/js?callback=initMap');
});