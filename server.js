var express = require('express');
var request = require('request');
var config = require('./config');
var app = express();
var http = require('http').Server(app);
var request = require('request');
var socketIO = require('socket.io')(http);
var socketClient = null;

app.use(express.static('./public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/home.html');
});

var widgets = require('./widgets');
require('./widget_agario.js')(socketIO);

app.get('/weather', widgets.weather);
app.get('/news', widgets.news);
app.get('/agario', widgets.agario);
app.get('/cinema', widgets.cinema);

// Web Socket IO for sending gestures to client
socketIO.of('/motion').on('connection', function(socket){ socketClient = socket; });
// Forwarding between motion server and client
app.get('/motion/gesture', function (req, res) { console.log(req.query); socketClient.emit('gesture', req.query); res.sendStatus(200); })
app.get('/motion/takePhoto', function (req, res) { request(config.web.motionUrl, function(err) {}); res.sendStatus(200); })

http.listen(config.web.port, function () {
  console.log('Server listening on port %d', config.web.port);
});

setInterval(function () { socketClient.emit('gesture', '{"slideRight": false, "slideDown": false, "slideUp": false, "angle": 153.9787573503369, "palm": false, "thumbsDown": false, "slideLeft": false, "thumbsUp": false}')}, 5000);