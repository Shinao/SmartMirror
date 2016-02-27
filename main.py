import urllib.request
import json
import logging
import os.path
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
from tornado.options import define, options, parse_command_line

""" SmartMirror web server """

define('port', default=8888, help="port to listen on")
define('debug', default=True, group='application',
       help="run in debug mode (with automatic reloading)")


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('home.html')
		
class ApiHandler(tornado.web.RequestHandler):
    def get(self, id):
        weather_data = urllib.request.urlopen('http://api.openweathermap.org/data/2.5/weather?id=2988507&units=metric&appid=44db6a862fba0b067b1930da0d769e98').read()
        self.write(json.loads(weather_data.decode('utf-8')))

def main():
    parse_command_line(final=False)

    app = tornado.web.Application(
        [
            ('/', MainHandler),
			('/api/(.*)', ApiHandler),
        ],
		template_path=os.path.join(os.path.dirname(__file__), "templates"),
        static_path=os.path.join(os.path.dirname(__file__), "static"),
        debug=options.debug)
    app.listen(options.port)

    logging.info('Listening on http://localhost:%d' % options.port)
    tornado.ioloop.IOLoop.current().start()

if __name__ == '__main__':
    main()