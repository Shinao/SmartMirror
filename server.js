var express = require('express');
var config = require('./config');
var app = express();
var http = require('http').Server(app);

app.use(express.static('./public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/home.html');
});

// Widgets needing infos from server (scraping infos mostly)
var widgets = require('./widgets');
app.get('/weather', widgets.weather);
app.get('/news', widgets.news);
app.get('/cinema', widgets.cinema);

// Forwarding between motion server and client
require('./motion')(app, http);

http.listen(config.web.port, function () {
  console.log('Server listening on port %d', config.web.port);
});