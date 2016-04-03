$(document).ready(function() {
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
});