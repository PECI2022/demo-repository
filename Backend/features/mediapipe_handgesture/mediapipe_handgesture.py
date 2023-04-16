# Guide: https://developers.google.com/mediapipe/solutions/vision/hand_landmarker/python#video

import os

import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

import cv2

model_path = __file__[:__file__.rfind('/')]+'/hand_landmarker.task'

import mediapipe as mp

class Mediapipe_handgesture:
    def __init__(self) -> None:
        BaseOptions = mp.tasks.BaseOptions
        self.HandLandmarker = mp.tasks.vision.HandLandmarker
        HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
        VisionRunningMode = mp.tasks.vision.RunningMode

        # Create a hand landmarker instance with the video mode:
        self.options = HandLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=model_path),
            running_mode=VisionRunningMode.VIDEO)
        
    def getLandMarks(self, videoPath: str) -> list:
        with self.HandLandmarker.create_from_options(self.options) as landmarker:
            cap = cv2.VideoCapture(videoPath)

            # fps = cap.get(cv2.CAP_PROP_FPS)

            while(cap.isOpened()):
                ret, frame = cap.read()

                if not ret:
                    break

                # cv2.imshow('frame', frame)
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame)

                timestamp = int(cap.get(cv2.CAP_PROP_POS_MSEC))

                hand_landmarker_result = landmarker.detect_for_video(mp_image, timestamp)
                # print(hand_landmarker_result)

                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
            
            cap.release()
            cv2.destroyAllWindows()

if __name__=='__main__':
    featureClass = Mediapipe_handgesture()
    print(featureClass.getLandMarks('yeye.webm'))