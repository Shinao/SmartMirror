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
app.get('/motion/gesture', function (req, res) { try { socketClient.emit('gesture', req.query); } catch(e) {} res.sendStatus(200); });
app.get('/motion/takePhoto', function (req, res) { request(config.web.motionUrl, function(err) {}); res.sendStatus(200); });
app.get('/motion/uploadPhoto', function (req, res) { 
  'use strict';

  var fs = require('fs');
  var google = require('googleapis');
  var drive = google.drive('v2');
  var OAuth2Client = google.auth.OAuth2;

  // Client ID and client secret are available at
  // https://code.google.com/apis/console
  var CLIENT_ID = "625168260868-d7khqbuva1m80s46a7rv8cglkpko7lnb.apps.googleusercontent.com";
  var CLIENT_SECRET = "cfN3dYpE5PyRI41v_r2an14J";
  var REDIRECT_URL = 'http://whatever.com/oauth';

  var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
  
  // generate a url that asks permissions for Google+ and Google Calendar scopes
// var scopes = [
//   'https://www.googleapis.com/auth/drive',
// ];

// var url = oauth2Client.generateAuthUrl({
//   access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
//   scope: 'https://www.googleapis.com/auth/drive' // If you only need one scope you can pass it as string
// });

// res.send("<a href="+url+">Click here to get code</a>");
  
  oauth2Client.getToken(config.widget.photo.refreshToken, function(err, tokens) {
  // Now tokens contains an access_token and an optional refresh_token. Save them.
  if(!err) {
    oauth2Client.setCredentials(tokens);
    console.log("Token retrieved: ");
    console.log(tokens);
    fs.writeFile("./drive_access_token.txt", tokens.refresh_token);  
  }
  else
    console.log("ERROR getToken: " + err);
    
  var saved_access_token = '';
  try { saved_access_token = fs.readFileSync('./drive_access_token.txt').toString(); }
  catch (e) { console.log("Error getting access token"); }
    
  oauth2Client.setCredentials({
    access_token: saved_access_token,
    refresh_token: config.widget.photo.refreshToken
  });
    
    // insertion example
  drive.files.insert({
    resource: {
      title: 'Test',
      mimeType: 'text/plain'
    },
    media: {
      mimeType: 'text/plain',
      body: 'Hello World updated with metadata'
    },
    auth: oauth2Client
    }, function (err, response) {
    console.log('error:', err, 'inserted:', response);
  });
});
  
  // oauth2Client.refreshAccessToken(function(err, tokens){ console.log(err); console.log("//"); console.log(tokens);});


  // drive.files.insert({
  //   resource: {
  //     title: 'testimage.jpg',
  //     mimeType: 'image/jpg'
  //   },
  //   media: {
  //     mimeType: 'image/jpg',
  //     body: fs.createReadStream('frame.jpg') // read streams are awesome!
  //   },
  //   auth: oauth2Client
  // }, function (err, response) {
  //   console.log('error:', err, 'inserted:', response);
  // });
});

http.listen(config.web.port, function () {
  console.log('Server listening on port %d', config.web.port);
});