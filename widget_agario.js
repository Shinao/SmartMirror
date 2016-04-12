var agario = function(http) {
	var AgarioClient = require('agario-client');

	var io = require('socket.io')(http);
	
	var region = 'EU-London'; // Server region to request
	var agario_client = new AgarioClient('workerSmartMirror'); //create new agario_client and call it "worker" (not nickname)
	var interval_id = 0; // Game refreshing callback
	var interval_reconnection = 3;
	
	var user_socket = undefined;
	
	agario_client.debug = 1; // Setting debug to 1 (avaialble 0-5)
	agario_client.auth_token = ''; // You can put here your auth token to authorize agario_client. Check in README.md how to get it

	io.on('connection', function(socket){
		user_socket = socket;
		
		connectToAgarioServer();
		
		socket.on('disconnect', function() {
			console.log("Socket closing, disconnect from agario server");
			agario_client.disconnect(); 
		});
		
		socket.on('moveTo', function(x, y) {
			agario_client.moveTo(x, y);
		});
	});
	
	var connectToAgarioServer = function()
	{
		console.log('Requesting server in region ' + region);
		AgarioClient.servers.getFFAServer({region: region}, function(srv) { // Requesting FFA server
			if (!srv.server)
				return console.log('Failed to request server (error=' + srv.error + ', error_source=' + srv.error_source + ')');
			
			console.log('Connecting to ' + srv.server + ' with key ' + srv.key);
			agario_client.connect('ws://' + srv.server, srv.key); // Do not forget to add ws://
		});

	  console.log('User socket.io connected');
	}
	
	var replacerBalls = function(key, value)
	{
		if (key == "client")
			return undefined;
		return value;
	}
	
	var sendGameDetail = function()
	{
		var balls = [];
		for (var ball_id in agario_client.balls)
		{
			var ball = agario_client.balls[ball_id];
				if (ball.x == 0 || ball.destroyed || !ball.visible)
					continue;
			
			balls.push(ball);
		}
		
		balls.sort(function(a, b) {return (a.size > b.size) ? 1 : 0;});
		
		user_socket.emit('GAME_DETAIL', JSON.stringify(balls, replacerBalls));
	}

	agario_client.on('connected', function() {
		agario_client.log('spawning');
		agario_client.spawn('smartMirrorClient'); // Respawn
		interval_id = setInterval(sendGameDetail, 1000 / 30); // 30 FPS Refresh
	});

	agario_client.on('connectionError', function(e) {
		agario_client.log('Connection failed with reason: ' + e);
		agario_client.log('Server address set to: ' + agario_client.server + ' please check if this is correct and working address');
		
		agario_client.log('Reconnecting in ' + interval_reconnection + ' seconds');
		setTimeout(connectToAgarioServer, interval_reconnection * 1000);
	});

	agario_client.on('reset', function() { // When agario_client clears everything (connection lost?)
		clearInterval(interval_id);
	});
	
	agario_client.on('lostMyBalls', function() { // When i lost all my balls
		agario_client.log('respawning');
		agario_client.spawn('smartMirrorClient'); // Spawning new ball with nickname "agario-client"
	});
};

module.exports = agario;