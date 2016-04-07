$(document).ready(function() {
	var animationDuration = 750;
		
	var scaleCurve = mojs.easing.path('M0,100 L25,99.9999983 C26.2328835,75.0708847 19.7847843,0 100,0');
    var el = document.querySelector('.progress-button'),
	elSpan = el.querySelector('button'),
	
	// mo.js timeline obj
	timeline = new mojs.Timeline(),

	// Tweens for the animation
	// burst animation
	tween1 = new mojs.Burst({
		parent: el,
		duration: 1500,
		shape : 'circle',
		fill : [ '#988ADE', '#DE8AA0', '#8AAEDE', '#8ADEAD', '#DEC58A', '#8AD1DE' ],
		x: '50%',
		y: '50%',
		opacity: 0.6,
		childOptions: { radius: {20:0} },
		radius: {40:120},
		count: 6,
		isSwirl: true,
		isRunLess: true,
		easing: mojs.easing.bezier(0.1, 1, 0.3, 1)
	}),
	// ring animation
	tween2 = new mojs.Transit({
		parent: el,
		duration: animationDuration,
		type: 'circle',
		radius: {0: 80},
		fill: 'transparent',
		stroke: '#988ADE',
		strokeWidth: {5:0},
		opacity: 1,
		x: '50%',     
		y: '50%',
		isRunLess: true,
		easing: mojs.easing.bezier(0, 1, 0.5, 1)
	}),
	// icon scale animation
	tween3 = new mojs.Tween({
		duration : 100,
		onUpdate: function(progress) {
			var scaleProgress = scaleCurve(progress);
			elSpan.style.WebkitTransform = elSpan.style.transform = 'scale3d(' + scaleProgress + ',' + scaleProgress + ',1)';
		}
	});

	timeline.add(tween1, tween2, tween3);
	 
	// Utils Extension
	Number.prototype.clamp = function(min, max) {
		return Math.min(Math.max(this, min), max);
	};
	(function($){
		$.fn.filterFind = function(selector) { 
			return this.find('*')         // Take the current selection and find all descendants,
					   .addBack()         // add the original selection back to the set 
					   .filter(selector); // and filter by the selector.
		};
	})(jQuery);
	(function($) {
		$.fn.svgDraw = function(progress) {
			this.filterFind('path').each(function() {
				var pathLength = this.getTotalLength();
				$(this).css('strokeDasharray', pathLength + ' ' + pathLength);
				$(this).css('strokeDashoffset', pathLength * ((1 - progress)).clamp(0, 1));
			});
			
			return this;
		};
	})(jQuery);

	$('.progress-button').addClass('loading')
	$(this).find('.progress-circle').svgDraw(0);

	//$('.progress-button .progress-circle').svgDraw(0);
	$('.progress-button').on('click', function() {
		var $button = $(this);
		 var $progress = $(this).find('.progress-circle');
		 
		if ($button.hasClass('success'))
		{
			$button.removeClass('success');
			$button.addClass('loading');
			$progress.svgDraw(0);
			return;
		}
		
		$(this).addClass('loading');
		
	   
		var progress = 0;
		var intervalId = setInterval(function() {
			progress += 0.07;
			$progress.svgDraw(progress);
			
			if( progress >= 1.25) {
				clearInterval(intervalId);
				
				$button.removeClass('loading');
				
				$button.addClass('success');
				timeline.start();
				
				setTimeout(function() {
					$(".pt-page-1").addClass("pt-page-moveToLeftFade").removeClass("pt-page-current");
					$(".pt-page-2").addClass("pt-page-current pt-page-moveFromRightFade");
					
					setTimeout(function() {
						$(".pt-page-1").removeClass("pt-page-current");
					}, 1000);
				}, animationDuration);

				//$button.addClass('error');
			}
		}, 50);
		
		// Now that we finished, unbind
		//$(this).off('click');
	});
	
			
		setTimeout(function() {
					$(".pt-page-1").addClass("pt-page-moveToLeftFade").removeClass("pt-page-current");
					$(".pt-page-2").addClass("pt-page-current pt-page-moveFromRightFade");
					
					setTimeout(function() {
						$(".pt-page-1").removeClass("pt-page-current");
					}, 1000);
				}, 10);
});