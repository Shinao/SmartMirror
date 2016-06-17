import cv2
import time
from motion import Motion
from tornado import web, ioloop
import threading
import json
import requests
from config import config
import logging

from motion import Motion
from config import config
import main

def nothing(x):
    pass

def ManageMotion():
    motion = Motion()

    # Param on the fly
    cv2.namedWindow('param')
    cv2.createTrackbar('MAX H', 'param', 1, 255, nothing)
    cv2.createTrackbar('MAX S', 'param', 1, 255, nothing)
    cv2.createTrackbar('MAX V', 'param', 1, 255, nothing)
    cv2.createTrackbar('MIN H', 'param', 1, 255, nothing)
    cv2.createTrackbar('MIN S', 'param', 1, 255, nothing)
    cv2.createTrackbar('MIN V', 'param', 1, 255, nothing)

    cv2.setTrackbarPos('MAX H', 'param', config['hand']['hsv_upper_blue'][0])
    cv2.setTrackbarPos('MAX S', 'param', config['hand']['hsv_upper_blue'][1])
    cv2.setTrackbarPos('MAX V', 'param', config['hand']['hsv_upper_blue'][2])
    cv2.setTrackbarPos('MIN H', 'param', config['hand']['hsv_lower_blue'][0])
    cv2.setTrackbarPos('MIN S', 'param', config['hand']['hsv_lower_blue'][1])
    cv2.setTrackbarPos('MIN V', 'param', config['hand']['hsv_lower_blue'][2])
    frameIdx = 0
    currentSliding = "None"
    timeElapsedSinceLastSlide = time.time()

    while motion.IsActive():
        # Refresh OpenCV
        cv2.waitKey(1)

        main.ManageCommands(motion)

        # Refresh config from param
        #config['hand']['hsv_upper_blue'] = [cv2.getTrackbarPos('MAX H', 'param'), cv2.getTrackbarPos('MAX S', 'param'), cv2.getTrackbarPos('MAX V', 'param')]
        #config['hand']['hsv_lower_blue'] = [cv2.getTrackbarPos('MIN H', 'param'), cv2.getTrackbarPos('MIN S', 'param'), cv2.getTrackbarPos('MIN V', 'param')]

        # Manage motion and gestures
        motion.GetInformationOnNextFrame()

        # Infos movement
        try:
            cv2.putText(motion.frameDifference, "Elapsed: " + str(motion.TimeElapsedSinceLastMotion()) + "/" + str(config['timeToWaitWhenNoMovementBeforeSleep']), (5, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.putText(motion.frameDifference, "Movement: " + str(motion.movementRatio) + "/" + str(config['frameDifferenceRatioForMovement']), (5, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.imshow('Movement detected', motion.frameDifference)
        except:
            pass

        if motion.TimeElapsedSinceLastMotion() > config['timeToWaitWhenNoMovementBeforeSleep']:
            cv2.putText(motion.currentFrame, "SLEEP MODE NO MOVEMENT", (5, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.imshow('Current Frame', motion.currentFrame)
            time.sleep(config['timeToSleepWhenNoMovement'])

        gesture = motion.GetGesture()
        if gesture.properties['palm']:
            print("PALM")
        threading.Thread(target=main.SendGesture, args=(gesture,)).start()

        # Gesture infos
        try:
            #print("Frame: " + str(frameIdx))
            frameIdx += 1
            #print(gesture.properties)

            if motion.handTracked is None:
                cv2.putText(motion.currentFrame, "Seach Palm", (5, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, 200, 1)

            cv2.imshow('Current Frame', motion.currentFrame)

            cv2.imshow('Mask from HSV Range', motion.mask_rafined)
            cv2.putText(motion.currentFrame, "Width: " + str(gesture.recW), (5, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, 200, 1)
            cv2.putText(motion.currentFrame, "Height: " + str(gesture.recH), (5, 250), cv2.FONT_HERSHEY_SIMPLEX, 1, 200, 1)
            cv2.putText(motion.currentFrame, "SRatio: " + str(gesture.recH / gesture.recW), (5, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, 200, 1)
            cv2.rectangle(motion.currentFrame, (gesture.recX, gesture.recY), (gesture.recX + gesture.recW, gesture.recY + gesture.recH), (0, 255, 0), 2)

            cv2.putText(motion.currentFrame, "MSize: " + str(gesture.moments['m00']), (5, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, 200, 1)
            cv2.drawContours(motion.currentFrame, [gesture.handContour], 0, (0, 255, 0), 3)
            cv2.circle(motion.currentFrame, (int(gesture.centerX), int(gesture.centerY)), int(gesture.radius / 1.5), [255, 0, 255], 1)
            cv2.circle(motion.currentFrame, (int(gesture.centerX), int(gesture.centerY)), int(gesture.radius / 3.2), [255, 0, 255], 1)
            cv2.putText(motion.currentFrame, "A: " + str(gesture.properties['angle']), (5, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, 200)

            if gesture.properties['palm']:
                cv2.putText(motion.currentFrame, "PALM", (5, 400), cv2.FONT_HERSHEY_SIMPLEX, 2, 150, 3)
            elif gesture.properties['thumbsUp']:
                cv2.putText(motion.currentFrame, "THUMBS UP", (5, 400), cv2.FONT_HERSHEY_SIMPLEX, 2, 150, 3)
            elif gesture.properties['thumbsDown']:
                cv2.putText(motion.currentFrame, "THUMBS DOWN", (5, 400), cv2.FONT_HERSHEY_SIMPLEX, 2, 150, 3)
            if gesture.properties['slideUp'] or gesture.properties['slideDown'] or gesture.properties['slideRight'] or gesture.properties['slideLeft']:
                timeElapsedSinceLastSlide = time.time()
                currentSliding ="UP" if gesture.properties['slideUp'] else "DOWN" if gesture.properties['slideDown'] else "RIGHT" if gesture.properties['slideRight'] else "LEFT"
            if time.time() - timeElapsedSinceLastSlide < 1:
                cv2.putText(motion.currentFrame, "Sliding " + currentSliding, (5, 450), cv2.FONT_HERSHEY_SIMPLEX, 2, 150, 3)

            for defect in gesture.palmDefects:
                cv2.line(motion.currentFrame, defect[0], defect[1], [255, 0, 0], 2)
                cv2.circle(motion.currentFrame, defect[2], 6, [0, 0, 255], -1)

            cv2.imshow('Current Frame', motion.currentFrame)
        except:
            pass


        pressedKey = cv2.waitKey(33)
        if pressedKey == 27:  # Esc key to stop
            break

    motion.Dispose()

if __name__ == '__main__':
    threading.Thread(target=ManageMotion).start()

    application = web.Application([
        (r"/takePhoto", main.CommandHandler),
    ])
    application.listen(3001)
    ioloop.IOLoop.current().start()
