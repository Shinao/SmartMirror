config = {
    # When on-board camera is used, not a USB one
    'piCamera': {
        'useCameraBoard': False,
        'framerate': 16,
        'resolution': (320, 240)
    },
    # Avoid doing things when nothing happens
    'timeToSleepWhenNoMovement': 1,
    # No movement but maybe it will start again
    'timeToWaitWhenNoMovementBeforeSleep': 5,
    # How much difference between frame there must be for it to be called movement
    'frameDifferenceRatioForMovement': 1,
    'hand': {
        # Min/Max HSV values to get the palm
        'hsv_palm_min': [0, 0, 0],
        'hsv_palm_max': [255, 255, 255],
        # For the hand color range we will take the HSV center point of the palm and apply these inc/dec
        'hsv_hand_dec': [255, 55, 32],
        'hsv_hand_inc': [255, 255, 255],
        # Hand not found anymore, do not revert to palm detection before x seconds
        'timeToKeepSearchingHandWhenLostTracking': 1,
        # Minimum size of hand to avoid false detection
        'minimumHeight': 80,
        'maximumHeight': 350,
        'minimumWidth': 80,
        'maximumWidth': 320,
        # Size of thumbs compared to the hand
        'thumbsDetectMinimumHeightRatio': 0.12,
        # Defect between each finger max x/y distance between each other
        'MaximumYDistanceBetweenDefectForPalmInHandRatio': 0.08,
        'MaximumXDistanceBetweenDefectForPalmInHandRatio': 0.2,
        # How much your hand much move to be a slide gesture
        'minimumMoveHandForSlide':  150,
        # How fast it must be for it to be a slide gesture
        'maximumTimeHandForSlide': 0.5,
        # How long after a slide gesture you can do another one
        'delayAfterHandSlide': 0.5
    }
}