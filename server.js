var express = require('express');
var request = require('request');

var app = express();

var http = require('http').Server(app);

var listening_port = 3000;
var url_weather = 'http://api.openweathermap.org/data/2.5/weather?id=2988507&units=metric&appid=XXXXXX';
var url_cinema = 'http://www.allocine.fr/seance/salle_gen_csalle=C0159.html';
var url_news = 'http://www.france24.com/en/top-stories/rss';

app.use(express.static('./public'));

var widgets = require('./widgets.js');
require('./widget_agario.js')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/home.html');
});

app.get('/weather', widgets.weather);
app.get('/news', widgets.news);
app.get('/agario', widgets.agario);
app.get('/cinema', widgets.cinema);

http.listen(listening_port, function () {
  console.log('Server listening on port %d', listening_port);
});