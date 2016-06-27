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
	$('.progress-button .progress-circle').svgDraw(0);
	$('.progress-button').on('click', function() {
		menuButtonLoading = true;		
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
		
		intervalLoadingButtonId = setInterval(function() {
			progressButtonLoading += 0.07;
			$progress.svgDraw(progressButtonLoading);
			
			if (progressButtonLoading >= 1.25) {
				clearInterval(intervalLoadingButtonId);
				
				$button.removeClass('loading');
				$button.addClass('success');
				timeline.start();
				
				menuButtonLoading = false;
				setCallbackGesture(callbackGestureMainMenu);				
				
				setTimeout(function() {
					$(".pt-page-1").removeClass('pt-page-current').addClass("pt-page-moveToLeftFade");
					$(".pt-page-2").addClass("pt-page-current pt-page-moveFromRightFade");
					
					setTimeout(function() {
						buttonLoadingFromGesture = false;						
						progressButtonLoading = 0;
						$button.removeClass('success').addClass('loading');
						$progress.svgDraw(0);
						$(".pt-page-1").removeClass("pt-page-moveToLeftFade");
						$(".pt-page-2").removeClass("pt-page-moveFromRightFade");
					}, 1000);
					
				}, animationDuration);
			}
		}, 50);
	});
	
	setCallbackGesture(callbackGestureMenuButton);
});

var menuButtonLoading = false;
var intervalLoadingButtonId = 0;
var progressButtonLoading = 0;
var buttonLoadingFromGesture = false;
function callbackGestureMenuButton(gesture) {
	console.log(JSON.stringify(gesture))

	if (!menuButtonLoading)
	{
		if (gesture.palm && gesture.elapsedTimeWithSameGesture > 0.5)
		{
			buttonLoadingFromGesture = true;
			$('.progress-button').click();
		}
		return;
	}
	
	if (!buttonLoadingFromGesture)
		return;
	
	if (!gesture.palm)
	{
		clearInterval(intervalLoadingButtonId);
		$('.progress-button').removeClass('loading').addClass('error');
		menuButtonLoading = false;
		progressButtonLoading = 0;
		
		setTimeout(function() {
			$('.progress-button').removeClass('error').addClass('loading');
			$('.progress-button').find('.progress-circle').svgDraw(0);
			buttonLoadingFromGesture = false;						
		}, 1000);
	}
}