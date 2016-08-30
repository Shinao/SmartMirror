import cv2
import time, os
from motion import Motion
from tornado import web, ioloop
import threading
import json
import requests
from config import config
import logging

# Send gesture to node server
logging.getLogger("requests").setLevel(logging.WARNING) # get infos on error
take_photo = False
photo_filepath = ""
def SendGesture(gesture):
    try:
        requests.get("http://localhost:3000/motion/gesture", params=json.dumps(gesture.properties))
    except Exception as ex:
        print("Could not send gesture: " + str(ex))

# Received command from node server to take a photo
def ManageCommands(motion):
    global take_photo

    if not take_photo:
        return

    print("Taking photo: " + photo_filepath)
    cv2.imwrite("../public/" + photo_filepath, motion.currentFrame)
    take_photo = False

# Main loop - get gestures and send them
def ManageMotion():
    motion = Motion()

    while motion.IsActive():
        ManageCommands(motion)

        # Manage motion and gestures
        motion.GetInformationOnNextFrame()
        if motion.TimeElapsedSinceLastMotion() > config['timeToWaitWhenNoMovementBeforeSleep']:
            time.sleep(config['timeToSleepWhenNoMovement'])

        gesture = motion.GetGesture()

        threading.Thread(target=SendGesture, args=(gesture,)).start()

    motion.Dispose()
    os._exit(1)

class CommandHandler(web.RequestHandler):
    def get(self):
        global take_photo, photo_filepath
        filepath = self.get_argument('filepath', 'public/frame.jpg')
        take_photo = True
        photo_filepath = filepath

if __name__ == '__main__':
    threading.Thread(target=ManageMotion).start()

    application = web.Application([
        (r"/takePhoto", CommandHandler),
    ])
    application.listen(3001)
    ioloop.IOLoop.current().start()
