import cv2
import numpy as np
import time

from config import config
from gesture import Gesture

# Only used for in board raspberry pi camera
if config['piCamera']['useCameraBoard']:
    from picamera.array import PiRGBArray
    from picamera import PiCamera

class Motion(object):
    currentFrame = None
    previousFrame = None

    def __init__(self):
        self.mask_rafined = None
        self.debugPalm = False
        self.movementRatio = 0
        self.timeLastMotion = time.time()
        self.previousGestureProperties = None
        self.timeSinceLastDifferentGesture = time.time()
        self.handTracked = None
        self.onlyTrackedHandArea = None
        self.foundHand = False
        self.timeSinceFoundHandTracked = 0
        self.currentGesture = None
        self.handPointHSV = None

        if config['piCamera']['useCameraBoard']:
            self.picamerra = PiCamera()
            self.picamerra.resolution = config['piCamera']['resolution']
            self.picamerra.framerate = config['piCamera']['framerate']
        else:
            self.videoDevice = cv2.VideoCapture(0)

    def IsActive(self):
        if config['piCamera']['useCameraBoard']:
            return not self.picamerra.closed

        return self.videoDevice.isOpened()

    def TimeElapsedSinceLastMotion(self):
        return time.time() - self.timeLastMotion

    def Dispose(self):
        if config['piCamera']['useCameraBoard']:
            self.picamerra.close()
        else:
            self.videoDevice.release()

        cv2.destroyAllWindows()

    def FoundMovement(self):
        return int(self.movementRatio) > config['frameDifferenceRatioForMovement']

    # Manage raspberry pi camera or simple camera (see config['RaspberryPi'])
    def GetFrameFromVideoDevice(self):
        if not config['piCamera']['useCameraBoard']:
            _, Motion.currentFrame = self.videoDevice.read()
            return

        # grab an image from the camera and convert it to an array
        rawCapture = PiRGBArray(self.picamera)
        self.picamera.capture(rawCapture, format="bgr")
        Motion.currentFrame = rawCapture.array


    def GetInformationOnNextFrame(self):
        # Store previous frame
        Motion.previousFrame = Motion.currentFrame

        # Capture frame-by-frame
        self.GetFrameFromVideoDevice()
        if Motion.previousFrame == None:
            return

        # Get frame difference to avoid doing things when there is no movement
        self.frameDifference = cv2.absdiff(cv2.cvtColor(Motion.currentFrame, cv2.COLOR_RGB2GRAY), cv2.cvtColor(Motion .previousFrame, cv2.COLOR_RGB2GRAY))
        cntGray = 0
        for rowGray in self.frameDifference:
            for gray in rowGray:
                cntGray += gray
        self.movementRatio = cntGray / self.frameDifference.size

        if self.FoundMovement() is False:
            return

        # Keep track of last motion
        self.timeLastMotion = time.time()

    def TryToTrackHand(self):
        lower_blue_brightness = config['hand']['hsv_palm_max'][2]
        search_hand = Gesture()

        while lower_blue_brightness > 15:
            # define range of blue color in HSV
            lower_blue = np.array([config['hand']['hsv_palm_min'][0], config['hand']['hsv_palm_min'][1], lower_blue_brightness])
            upper_blue = np.array([config['hand']['hsv_palm_max'][0], config['hand']['hsv_palm_max'][1], config['hand']['hsv_palm_max'][2]])

            kernel = np.ones((5, 5), np.float32) / 25
            blurred = cv2.filter2D(self.currentFrame.copy(), -1, kernel)
            hsv = cv2.cvtColor(blurred, cv2.COLOR_BGR2HSV)

            # Threshold the HSV image to get only blue colors
            mask = cv2.inRange(hsv, lower_blue, upper_blue)
            self.mask_rafined = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

            # Debug Palm Detection
            if self.debugPalm:
                cv2.imshow('Mask from HSV Range', self.mask_rafined)
                cv2.waitKey(5)

            search_hand_mask = self.mask_rafined.copy()
            foundPalm = search_hand.SearchPalmFromMask(search_hand_mask)

            if foundPalm:
                # Set infos from tracked hand
                self.handTracked = search_hand
                self.timeSinceFoundHandTracked = time.time()
                self.handPointHSV = hsv[self.handTracked.centerY][self.handTracked.centerX]
                self.foundHand = True
                return

            lower_blue_brightness -= 10

        self.foundHand = False

    def FindHandFromTrack(self):
        # Get brightness from tracked hand
        kernel = np.ones((5, 5), np.float32) / 25
        blurred = cv2.filter2D(self.currentFrame.copy(), -1, kernel)
        hsv = cv2.cvtColor(blurred, cv2.COLOR_BGR2HSV)

        self.hand_lower_blue = self.AddValueToColorArray(
            [-config['hand']['hsv_hand_dec'][0], -config['hand']['hsv_hand_dec'][1], -config['hand']['hsv_hand_dec'][2]], self.handPointHSV.copy())
        self.hand_upper_blue = self.AddValueToColorArray(
            [config['hand']['hsv_hand_inc'][0], config['hand']['hsv_hand_inc'][1], config['hand']['hsv_hand_inc'][2]], self.handPointHSV.copy())

        mask = cv2.inRange(hsv, self.hand_lower_blue, self.hand_upper_blue)
        self.mask_rafined = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

        search_hand_mask = self.mask_rafined.copy()
        search_hand = Gesture()
        if search_hand.InitFromMaskAndPosition(search_hand_mask, self.handTracked.centerX, self.handTracked.centerY) is False:
            self.foundHand = False
        else:
            self.timeSinceFoundHandTracked = time.time()
            self.handTracked = search_hand
            self.handPointHSV = hsv[self.handTracked.centerY][self.handTracked.centerX]
            self.foundHand = True

    def AddValueToColor(self, value, color):
        result = color + value
        if result > 255:
            color = 255
        elif result < 0:
            color = 0
        else:
            color = result
        return color

    def AddValueToColorArray(self, value, colors):
        for idx in range(3):
            colors[idx] = self.AddValueToColor(value[idx], colors[idx])

        return colors

    def SetTimeElapsedSinceSameGesture(self):
        if self.previousGestureProperties is None:
            self.previousGestureProperties = self.currentGesture.properties.copy()

        if self.currentGesture.properties['palm'] == self.previousGestureProperties['palm'] and self.currentGesture.properties['thumbsUp'] == self.previousGestureProperties['thumbsUp'] and self.currentGesture.properties['thumbsDown'] == self.previousGestureProperties['thumbsDown'] and self.currentGesture.properties['slideRight'] == self.previousGestureProperties['slideRight'] and self.currentGesture.properties['slideLeft'] == self.previousGestureProperties['slideLeft'] and self.currentGesture.properties['slideDown'] == self.previousGestureProperties['slideDown'] and self.currentGesture.properties['slideUp'] == self.previousGestureProperties['slideUp']:
            self.currentGesture.properties['elapsedTimeWithSameGesture'] = time.time() - self.timeSinceLastDifferentGesture
        else:
            self.timeSinceLastDifferentGesture = time.time()
            self.currentGesture.properties['elapsedTimeWithSameGesture'] = 0

        self.previousGestureProperties = self.currentGesture.properties.copy()

    def GetGesture(self):
        # Retry a few times before initing with palm again
        timeElapsedSinceLastFoundHand = time.time() - self.timeSinceFoundHandTracked
        stillTringToFindHandFromTrack = timeElapsedSinceLastFoundHand < config['hand']['timeToKeepSearchingHandWhenLostTracking']
        if not stillTringToFindHandFromTrack:
            self.handTracked = None

        if self.handTracked is not None or stillTringToFindHandFromTrack:
            self.FindHandFromTrack()
        else:
            self.TryToTrackHand()

        self.currentGesture = self.handTracked
        if not self.foundHand:
            self.currentGesture = Gesture()
            self.currentGesture.properties['needInitPalm'] = not stillTringToFindHandFromTrack

        self.SetTimeElapsedSinceSameGesture()
        return self.currentGesture

    def equal_dicts(self, d1, d2, ignore_keys):
        ignored = set(ignore_keys)
        for k1, v1 in d1.items():
            if k1 not in ignored and (k1 not in d2 or d2[k1] != v1):
                return False
        for k2, v2 in d2.items():
            if k2 not in ignored and k2 not in d1:
                return False
        return True