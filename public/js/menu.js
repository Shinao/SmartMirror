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
	loadWidget("img/map.png", "test.html", "xxxx");
	loadWidget("img/drive_photo.png", "test.html", "xxxx");
	loadWidget("img/news.png", "test.html", "xxxx");
	loadWidget("img/cinema.png", "test.html", "xxxx");
	loadWidget("img/agario.png", "test.html", "xxxx");
});