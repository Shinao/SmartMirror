var express = require('express');
var request = require('request');
var config = require('./config');
var app = express();
var http = require('http').Server(app);
var request = require('request');
var fs = require('fs'); 
var socketIO = require('socket.io')(http);
var socketClient = null;

app.use(express.static('./public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/home.html');
});

var widgets = require('./widgets');


// Widgets needing infos from server (scraping infos mostly)
app.get('/weather', widgets.weather);
app.get('/news', widgets.news);
app.get('/cinema', widgets.cinema);

// Web Socket IO for sending gestures to client
socketIO.of('/motion').on('connection', function(socket){ socketClient = socket; });

// Forwarding between motion server and client
app.get('/motion/gesture', function (req, res) {
  try { 
    socketClient.emit('gesture', req.query); 
  } 
  catch(e) {} 
  res.sendStatus(200); 
});
app.get('/motion/takePhoto/:filepath', function (req, res) {
  try {  // Removing current photo if found
    fs.unlinkSync("public/" + req.params.filepath);
  } catch(e) {}
  request(config.web.motionUrl + req.params.filepath, function(err) {
    res.sendStatus(err ? 404 : 200); 
  }); 
});
app.get('/doesFileExist/:filepath', function (req, res) {
  fs.access("public/" + req.params.filepath, fs.R_OK | fs.W_OK, (err) => {
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

http.listen(config.web.port, function () {
  console.log('Server listening on port %d', config.web.port);
});