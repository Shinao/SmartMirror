function loadWidget(img, render_page, callback) {
	$(".swiper-wrapper").prepend(
	"<img class='swiper-slide' src='" + img
	+ "' data-render='" + render_page
	+ "' data-callback='" + callback
	+ "' />");
	
	var mySwiper = new Swiper ('.swiper-container', {
		// Optional parameters
		direction: 'horizontal',
		loop: true,

		// If we need pagination
		pagination: '.swiper-pagination',

		// Navigation arrows
		nextButton: '.swiper-button-next',
		prevButton: '.swiper-button-prev',

		preloadImages: true,
		effect: 'coverflow',
		centeredSlides: true,
		slidesPerView: 3,
		coverflow: {
			rotate: 50,

			depth: 100,
			modifier: 1,
			slideShadows: false,
			stretch: 0,
		}
	});
}

function callbackGestureMainMenu(gesture) {
	console.log("Menu widget callback");
}

$(document).ready(function() {
	callbackGesture = callbackGestureMainMenu;
	
	// Add your widget here
	loadWidget("img/drive_photo.png", "widget_drive_photo.html", "callbackGesturePhoto");
	loadWidget("img/agario.png", "widget_agario.html", "callbackGestureAgario");
	loadWidget("img/map.png", "widget_map.html", "callbackGestureMap");
	loadWidget("img/cinema.png", "widget_cinema.html", "callbackGestureCinema");
	loadWidget("img/news.png", "widget_news.html", "callbackGestureNews");
	
	// Widget click event
	$('body').on('click', '.swiper-slide-active', function() {
		var widget = $(this);
		$("#widget").load(widget.data('render'), function() {
			callbackGesture = window[widget.data('callback')];
			$(".screen-page-1").addClass("pt-page-moveToLeftFade");
			$(".screen-page-2").addClass("pt-page-current pt-page-moveFromRightFade");
		});
	});
	
	var motionSocket = io.connect('/motion');
	motionSocket.on('gesture', function(jsonGesture) {
		gesture = JSON.parse(jsonGesture);
		callbackGesture(gesture);
	});
});