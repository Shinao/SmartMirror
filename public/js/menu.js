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

$(document).ready(function() {
	loadWidget("img/drive_photo.png", "widget_drive_photo.html", "xxxx");
	loadWidget("img/agario.png", "widget_agario.html", "xxxx");
	loadWidget("img/map.png", "widget_map.html", "xxxx");
	loadWidget("img/cinema.png", "widget_cinema.html", "xxxx");
	loadWidget("img/news.png", "widget_news.html", "xxxx");
	
	$('body').on('click', '.swiper-slide-active', function() {
		$("#widget").load($(this).data('render'));
		
		$(".screen-page-1").addClass("pt-page-moveToLeftFade");
		$(".screen-page-2").addClass("pt-page-current pt-page-moveFromRightFade");
	});
});