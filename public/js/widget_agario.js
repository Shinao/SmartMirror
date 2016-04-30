$(document).ready(function() {
	var socket = io.connect('/agario');

	var screen_x = 0;
	var screen_y = 0;
	var borderSize = 20;
			
	var canvas = document.getElementById("canvasAgario");
	canvas.width = window.innerWidth - borderSize;
    canvas.height = window.innerHeight - borderSize;
	var ctx = canvas.getContext('2d');
	
	var start = new Date().getTime();

	
	$(document).keydown(function(e) {
		var end = new Date().getTime();
		var time = end - start;
		
		if (time < 10)
			return;
		
		start = new Date().getTime();
	
		var posx = screen_x + canvas.width / 2;
		var posy = screen_y + canvas.height / 2;
		switch(e.which) {
			case 37: // left
				socket.emit('moveTo', posx-2000, posy);
			break;

			case 38: // up
			socket.emit('moveTo', posx, posy-2000);
			break;

			case 39: // right
			socket.emit('moveTo', posx+2000, posy);
			break;

			case 40: // down
			socket.emit('moveTo', posx, posy+2000);
			break;

			default: return; // exit this handler for other keys
		}
		e.preventDefault(); // prevent the default action (scroll / move caret)
	});
	
	socket.on('GAME_DETAIL', function(game_detail) {
		game_detail = JSON.parse(game_detail);
		for (var ball_id in game_detail)
		{
			if (game_detail[ball_id].mine)
			{
				var my_ball = game_detail[ball_id];
				screen_x = my_ball.x - canvas.width / 2;
				screen_y = my_ball.y - canvas.height / 2;
				break;
			}
		}
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		for (var ball_id in game_detail)
		{
			var ball = game_detail[ball_id];
			if (ball.x == 0 || ball.destroyed || !ball.visible)
			{ console.log("WUT");	continue; }

			ball.x -= screen_x;
			ball.y -= screen_y;

			ctx.beginPath();
			ctx.arc(ball.x, ball.y, ball.size, 0, 2 * Math.PI, false);
			
			ctx.fillStyle = ball.color;
			if (ball.virus)
			{
				ctx.fillStyle = "rgba(255, 123, 123, 0.5)";
				ctx.lineWidth = 4;
				ctx.strokeStyle = '#FF3333';
				ctx.stroke();
			}
			else if (ball.size > 15)
			{
				ctx.lineWidth = 4;
				ctx.strokeStyle = '#AAAAAA';
				ctx.stroke();
			}
			
			ctx.fill();
			ctx.closePath();
		}
	
		ctx.beginPath();
		ctx.rect(0, 0, canvas.width, canvas.height);
		ctx.strokeStyle = '#FFFFFF';
		ctx.stroke();
		ctx.closePath();
	});
});