var config = {};

config.widget = {};
config.widget.cinema = {};
config.widget.news = {};
config.widget.weather = {};
config.widget.photo = {};
config.web = {};

config.widget.cinema.url = 'http://www.allocine.fr/seance/salle_gen_csalle=C0159.html';
config.widget.cinema.refreshRateInMinutes = 60;
config.widget.weather.appid = 'FindYourOwnKey';
config.widget.weather.url = 'http://api.openweathermap.org/data/2.5/weather?id=2988507&units=metric&appid=' + config.widget.weather.appid;
config.widget.weather.refreshRateInMinutes = 10;
config.widget.news.url =  'http://www.france24.com/en/top-stories/rss';
config.widget.news.refreshRateInMinutes = 60;
config.widget.photo.dropboxKey = 'FindYourOwnKey';

config.web.port = 3000;
config.web.motionUrl = 'http://localhost:3001/takePhoto?filepath=';

module.exports = config;