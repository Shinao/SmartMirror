var express = require('express');
var request = require('request');
var config = require('./config');
var app = express();
var http = require('http').Server(app);

app.use(express.static('./public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/home.html');
});

var widgets = require('./widgets');
require('./widget_agario.js')(http);

app.get('/weather', widgets.weather);
app.get('/news', widgets.news);
app.get('/agario', widgets.agario);
app.get('/cinema', widgets.cinema);

http.listen(config.web.port, function () {
  console.log('Server listening on port %d', config.web.port);
});