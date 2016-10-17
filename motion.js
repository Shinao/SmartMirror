var config = require('./config');
var fs = require('fs');
var request = require('request');
var socketClient = null;
var socketIO = null;

module.exports = function (app, http) {
	socketIO = require('socket.io')(http);

	// Web Socket IO for sending gestures to client
	socketIO.of('/motion').on('connection', function(socket){ 
		socketClient = socket;
	});

	app.get('/motion/gesture', function (req, res) {
		try {   
			socketClient.emit('gesture', req.query); 
		}  catch(e) {} 
		res.sendStatus(200); 
	});

	app.get('/motion/takePhoto/:filepath', function (req, res) {
		try {  
			fs.unlinkSync("public/" + req.params.filepath); // Removing current photo if found
		} 
		catch(e) {}

		request(config.web.motionUrl + req.params.filepath, function(err) {
			res.sendStatus(err ? 404 : 200); 
		}); 
	});

	app.get('/doesFileExist/:filepath', function (req, res) {
		fs.access("public/" + req.params.filepath, fs.R_OK | fs.W_OK, function(err) {
			res.sendStatus(err ? 404 : 200); 
		})
	});

	app.get('/motion/uploadPhoto/:filepath', function (req, res) {
		fs.readFile("public/" + req.params.filepath, function read(err, data) {
			if (err) {
				console.log("Could not read photo: ", err);
				res.sendStatus(404);
			}

			content = data;
			request.put('https://api-content.dropbox.com/1/files_put/auto/' + req.params.filepath, {
			headers: { Authorization: 'Bearer ' + config.widget.photo.dropboxKey,  'Content-Type': 'text/plain'},
			body:content},
			function optionalCallback (err, httpResponse, bodymsg) {
				if (err) {
					console.log("Could not upload to dropbox: ", err);
					res.sendStatus(400);
				}

				console.log("Uploaded photo to dropbox: ", bodymsg);
				res.sendStatus(200);
			});
		});
	});
}
