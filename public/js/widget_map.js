function callbackGestureMap(gesture) {
	if (gesture.palm && gesture.elapsedTimeWithSameGesture > 0.5)
		bringBackMainMenu();
}

function initMap() {
	var mapDiv = document.getElementById('map');

	var map = new google.maps.Map(mapDiv, {
		center: {lat: 48.85997285, lng: 2.3473104}, zoom: 15
	});

	var marker = new google.maps.Marker({
		position: {lat: 48.858321, lng: 2.345009},
		map: map,
		icon: '../img/home.png'
	});
}