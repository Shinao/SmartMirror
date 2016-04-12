var config = {};

config.widget = {};
config.widget.cinema = {};
config.widget.news = {};
config.widget.weather = {};
config.web = {};

config.widget.cinema.url = 'http://www.allocine.fr/seance/salle_gen_csalle=C0159.html';
config.widget.weather.appid = 'http://api.openweathermap.org/data/2.5/weather?id=2988507&units=metric&appid=XXXXXX';
config.widget.weather.url = 'http://api.openweathermap.org/data/2.5/weather?id=2988507&units=metric&appid=' + config.widget.weather.appid;
config.widget.news.url =  'http://www.france24.com/en/top-stories/rss';

config.web.port = 3000;

module.exports = config;