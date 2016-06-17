import cv2
import numpy as np
import math
import motion
import time
from config import config

import logging, sys
logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)

def in_circle(center_x, center_y, radius, x, y):
    dist = math.sqrt((center_x - x) ** 2 + (center_y - y) ** 2)
    return dist <= radius

class Gesture(object):
    # Sliding hand infos
    leftPositionsFromTime = []
    rightPositionsFromTime = []
    upPositionsFromTime = []
    downPositionsFromTime = []
    timeLastHandSlide = time.time()

    def __init__(self):
        self.SetDefaultGesture()

    def SetDefaultGesture(self):
        self.properties = {}
        self.properties['palm'] = False
        self.properties['thumbsUp'] = False
        self.properties['thumbsDown'] = False
        self.properties['angle'] = -1
        self.properties['slideLeft'] = False
        self.properties['slideRight'] = False
        self.properties['slideDown'] = False
        self.properties['slideUp'] = False
        self.properties['foundHand'] = False
        self.properties['needInitPalm'] = False
        self.properties['centerX'] = -1
        self.properties['centerY'] = -1
        self.palmDefects = []

    def CheckForPalm(self):
        self.palmDefects = []
        for i in range(self.defects.shape[0]):
            # Get defect infos
            s, e, f, d = self.defects[i, 0]
            start = tuple(self.handContour[s][0])
            end = tuple(self.handContour[e][0])
            far = tuple(self.handContour[f][0])

            # Check if defect is in the proper place
            if not in_circle(int(self.centerX), int(self.centerY), int(self.radius / 1.5), far[0], far[1]):
                continue
            if in_circle(int(self.centerX), int(self.centerY), int(self.radius / 3.2), far[0], far[1]):
                continue

            # Filter defect by angle
            a = math.sqrt((end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2)
            b = math.sqrt((far[0] - start[0]) ** 2 + (far[1] - start[1]) ** 2)
            c = math.sqrt((end[0] - far[0]) ** 2 + (end[1] - far[1]) ** 2)
            angle = math.acos((b ** 2 + c ** 2 - a ** 2) / (2 * b * c)) * 57
            self.properties['angle'] = angle
            if angle <= 120:
                self.palmDefects.append((start, end, far))
                if self.PalmDefectsValid():
                    self.properties['palm'] = True
                    return True

        return False

    def PalmDefectsValid(self):
        if len(self.palmDefects) < 4:
            return False

        nb_defect_above_line = 0
        positions_y = []
        positions_x = []
        for defect in self.palmDefects:
            if defect[2][1] < int(self.centerY):
                nb_defect_above_line += 1
                positions_x.append(defect[2][0])
                positions_y.append(defect[2][1])

        if nb_defect_above_line < 3:
            return False

        avg_y = sum(positions_y) / len(positions_y)
        for position in positions_y:
            if abs(position - avg_y) / self.recH > config['hand']['MaximumYDistanceBetweenDefectForPalmInHandRatio']:
                return False

        avg_x = sum(positions_x) / len(positions_x)
        for position in positions_x:
            if abs(position - avg_x) / self.recW > config['hand']['MaximumXDistanceBetweenDefectForPalmInHandRatio']:
                return False

        return True

    def InitFromMask(self, search_hand_mask):
        # Check each contours
        (_, contours, _) = cv2.findContours(search_hand_mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

        for contour in contours:
            if self.InitFromContour(contour):
                return True
        return False

    def InitFromMaskAndPosition(self, search_hand_mask, nearestFromX, nearestfromY):
        # Check each contours
        (_, contours, _) = cv2.findContours(search_hand_mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        distanceContours = []

        if len(contours) == 0:
            return False

        for contour in contours:
            cv2.drawContours(motion.Motion.currentFrame, [contour], 0, (0, 0, 250), 2)
            moment = cv2.moments(contour)
            centerX = int(moment["m10"] / moment["m00"])
            centerY = int(moment["m01"] / moment["m00"])
            distance = abs(centerX - nearestFromX) + abs(centerY - nearestfromY)
            distanceContours.append(distance)

        while contours:
            idxNearestContour = min(range(len(distanceContours)), key=distanceContours.__getitem__)
            if not self.InitFromContour(contours[idxNearestContour]):
                contours.pop(idxNearestContour)
                distanceContours.pop(idxNearestContour)
                continue
            return True
        return False

    def SearchPalmFromMask(self, search_hand_mask):
        if self.InitFromMask(search_hand_mask):
            return self.CheckForPalm()
        return False

    def CheckForThumbs(self):
        try:
            spaceOutsideOfCenter = (self.recH - (self.radius * 2)) / self.recH
            #print("Space: " + str(spaceOutsideOfCenter))
            if spaceOutsideOfCenter < config['hand']['thumbsDetectMinimumHeightRatio']:
                return

            # Detect up or down
            #print("Ratio: " + str(((self.recY + self.recH) - (self.centerY + self.radius)) / self.recH))
            if ((self.centerY - self.radius) - self.recY) / self.recH > config['hand']['thumbsDetectMinimumHeightRatio']:
                self.properties['thumbsUp'] = True
            elif ((self.recY + self.recH) - (self.centerY + self.radius)) / self.recH > config['hand']['thumbsDetectMinimumHeightRatio']:
                self.properties['thumbsDown'] = True
        except:
            pass

    def CheckForSliding(self):
        currentTime = time.time()

        #print("LastHandSlide: " + str(currentTime - Gesture.timeLastHandSlide))
        #print("TimeLastHandSlide: " + str(Gesture.timeLastHandSlide))

        if currentTime - Gesture.timeLastHandSlide < config['hand']['delayAfterHandSlide']:
            return

        # Check each direction,
        Gesture.leftPositionsFromTime, self.properties['slideLeft'] = self.CheckSlidingFromPositions(Gesture.leftPositionsFromTime, self.recX, True, currentTime)
        Gesture.rightPositionsFromTime, self.properties['slideRight'] = self.CheckSlidingFromPositions(Gesture.rightPositionsFromTime, self.recX + self.recW, False, currentTime)
        Gesture.upPositionsFromTime, self.properties['slideDown'] = self.CheckSlidingFromPositions(Gesture.upPositionsFromTime, self.recY, True, currentTime)
        Gesture.downPositionsFromTime, self.properties['slideUp'] = self.CheckSlidingFromPositions(Gesture.downPositionsFromTime, self.recY + self.recH, False, currentTime)

    def CheckSlidingFromPositions(self, positionsFromTime, newPosition, newPositionMustBeGreater, currentTime):
        # Clean timed out position
        sliding = False
        positionsFromTime = [positionAndTime for positionAndTime in positionsFromTime if
                             currentTime - positionAndTime[1] < config['hand']['maximumTimeHandForSlide']]

        # Clean if current contradict revert from last position
        if len(positionsFromTime) > 0 and ((not newPositionMustBeGreater and positionsFromTime[-1][0] < newPosition) or (
            newPositionMustBeGreater and positionsFromTime[-1][0] > newPosition)):
            positionsFromTime = []

        positionsFromTime.append((newPosition, currentTime))

        positionHandMove = abs(positionsFromTime[0][0] - positionsFromTime[-1][0])
        if len(positionsFromTime) > 1 and positionHandMove >= config['hand']['minimumMoveHandForSlide']:
            sliding = True
            leftPositionsFromTime = []
            rightPositionsFromTime = []
            upPositionsFromTime = []
            downPositionsFromTime = []
            #print("SETTING: " + str(currentTime))
            Gesture.timeLastHandSlide = currentTime

        return (positionsFromTime, sliding)

    def InitGestures(self):
        self.CheckForPalm()
        if not self.properties['palm']:
            self.CheckForThumbs()
        self.CheckForSliding()

    def InitFromContour(self, contour):
        # Prefilter on bounding rect because moments take some time
        self.recX, self.recY, self.recW, self.recH = cv2.boundingRect(contour)
        if self.recH < config['hand']['minimumHeight'] or self.recH > config['hand']['maximumHeight'] or self.recW < \
                config['hand']['minimumWidth'] or self.recW > config['hand']['maximumWidth']:
            return False

        self.handContour = contour
        self.properties['foundHand'] = True

        # Get general info
        self.moments = cv2.moments(contour)
        self.hull = cv2.convexHull(self.handContour, returnPoints = False)
        self.defects = cv2.convexityDefects(self.handContour, self.hull)

        _,radius = cv2.minEnclosingCircle(self.handContour)
        self.radius = int(radius / 1.2)
        self.centerX = int(self.moments['m10'] / self.moments['m00'])
        self.centerY = int(self.moments['m01'] / self.moments['m00'])

        self.properties['centerX'] = self.centerX
        self.properties['centerY'] = self.centerY

        self.InitGestures()

        return True