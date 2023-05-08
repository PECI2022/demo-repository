# Guide: https://developers.google.com/mediapipe/solutions/vision/hand_landmarker/python#video

import inspect
import os
from time import sleep

import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

import cv2

class Mediapipe_facedetection:
    def __init__(self) -> None:
        pass
        
    def getLandMarks(self, videoPath) -> list:
        mp_face_detection = mp.solutions.face_detection
        mp_drawing = mp.solutions.drawing_utils
        mp_drawing_styles = mp.solutions.drawing_styles
        mp_face_mesh = mp.solutions.face_mesh

        results = []
        with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5) as face_detection:
            cap = cv2.VideoCapture(videoPath)

            idx = 0
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret: break

                result = face_detection.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

                box = result.detections[0].location_data.relative_bounding_box
                results.append({"xmin": box.xmin, "ymin": box.ymin, "width": box.width, "height": box.height})
                
        return results






if __name__=='__main__':
    featureClass = Mediapipe_facedetection()
    result = featureClass.getLandMarks('yeye.webm')
    print(result)