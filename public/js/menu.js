$(document).ready(function() {
	// Add your widget here
	
	loadWidget("img/doodlejump.png", "widget_doodlejump.html", "callbackGestureDoodleJump");
	loadWidget("img/map.png", "widget_map.html", "callbackGestureMap");
	loadWidget("img/cinema.png", "widget_cinema.html", "callbackGestureCinema");
	loadWidget("img/drive_photo.png", "widget_photo.html", "callbackGesturePhoto");
	loadWidget("img/news.png", "widget_news.html", "callbackGestureNews");
	
	// Widget click event
	$('body').on('click', '.swiper-slide-active', function() {
		var widget = $(this);
		$("#widget").load(widget.data('render'), function() {
			setCallbackGesture(window[widget.data('callback')]);
			$(".screen-page-1").addClass("pt-page-moveToLeftFade");
			$(".screen-page-2").addClass("pt-page-current pt-page-moveFromRightFade");
			setTimeout(function () { 
				$(".screen-page-1").removeClass("pt-page-current pt-page-moveToLeftFade");
				$(".screen-page-2").removeClass("pt-page-moveFromRightFade");
				$("#menuContainer").hide();
				$("#infoContainer").hide();
			}, 1000);
		});
	});
	
	var motionSocket = io.connect('/motion');
	motionSocket.on('gesture', function(jsonArray) {
		for (jsonGesture in jsonArray) break;
		gesture = JSON.parse(jsonGesture);
		
		callbackGesture(gesture);
	});
});

function loadWidget(img, render_page, callback) {
	$(".swiper-wrapper").prepend(
	"<img class='swiper-slide' src='" + img
	+ "' data-render='" + render_page
	+ "' data-callback='" + callback
	+ "' />");
	
	swiperMenu = new Swiper ('.swiper-container', {
		// Optional parameters
		direction: 'horizontal',
		loop: false,

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
	swiperMenu.slideNext(false);
}

var swiperMenu = null;
function callbackGestureMainMenu(gesture) {
	if ((!gesture.palm && gesture.elapsedTimeWithSameGesture > 10) ||
		(!gesture.foundHand && gesture.elapsedTimeWithSameGesture > 3))
	{
		$(".pt-page-2").addClass("pt-page-moveToRightFade");
		$(".pt-page-1").addClass("pt-page-current pt-page-moveFromLeftFade");
		setTimeout(function () { 
			$(".pt-page-1").removeClass("pt-page-moveFromLeftFade");
			$(".pt-page-2").removeClass("pt-page-current pt-page-moveToRightFade");
		}, 1000);
		setCallbackGesture(callbackGestureMenuButton);
		
		return;
	}
	
	if (gesture.slideLeft)
		swiperMenu.slideNext(false);
	else if (gesture.slideRight)
		swiperMenu.slidePrev(false);
	else if (gesture.thumbsUp && gesture.elapsedTimeWithSameGesture > 1)
		$('.swiper-slide-active').click();
}

function setCallbackGesture(callback) {
	callbackGesture = callback;
}

function bringBackMainMenu() {
	$("#menuContainer").show();
	$("#infoContainer").show();
	$(".screen-page-2").addClass("pt-page-moveToRightFade");
	$(".screen-page-1").addClass("pt-page-current pt-page-moveFromLeftFade");
	setTimeout(function () { 
		$(".screen-page-2").removeClass("pt-page-current pt-page-moveToRightFade");
		$(".screen-page-1").removeClass("pt-page-moveFromLeftFade");
		$("#widget").html("");
	}, 800);
	setCallbackGesture(callbackGestureMainMenu);
	window.scrollTo(0, 0);
}

function smoothScrollBy(position, timeInMs) {
	for (var nbFrame = 1; nbFrame <= 60; nbFrame += 1)
	{
		setTimeout(function() {
			window.scrollBy(0, position / 60);
		}, timeInMs / 60 * nbFrame);
	}
}