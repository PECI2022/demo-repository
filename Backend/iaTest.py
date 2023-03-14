from flask import Flask, send_from_directory, request, make_response
from flask_cors import CORS
from werkzeug.datastructures import FileStorage
from pymongo import MongoClient
import gridfs
import json
import os

import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)

@app.route('/')
def default():
    return "Running..."

model = load_model('models/mp_hand_gesture')
classNames = ['okay','peace','thumbs up','thumbs down','call me','stop','rock','live long','fist','smile']

mpHands = mp.solutions.hands
hands = mpHands.Hands(max_num_hands=1, min_detection_confidence=0.7)
mpDraw = mp.solutions.drawing_utils

@app.route('/uploadFrame', methods=['POST'])
def upload():
    blob = request.files['blob']
    blob.save('./a.jpeg')



    frame = cv2.imread('./a.jpeg')
    os.remove('./a.jpeg')
    # if frame==None:
    #     return {'status': 200}
    x, y, c = frame.shape
    print(x,y)


    # Flip the frame vertically
    frame = cv2.flip(frame, 1)
    # framergb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Get hand landmark prediction
    result = hands.process(frame)

    # print(result)
    
    className = ''

    # post process the result
    if result.multi_hand_landmarks:
        landmarks = []
        for handslms in result.multi_hand_landmarks:
            for lm in handslms.landmark:
                # print(id, lm)
                lmx = int(lm.x * x)
                lmy = int(lm.y * y)

                landmarks.append([lmx, lmy])

            # Drawing landmarks on frames
            # mpDraw.draw_landmarks(frame, handslms, mpHands.HAND_CONNECTIONS)

            # Predict gesture
            prediction = model.predict([landmarks])
            print(prediction)
            # print(prediction)
            classID = np.argmax(prediction)
            print(classID)
            className = classNames[classID]
            return {'status': 201, 'class': className, 'accuracy': float(prediction[0][classID]), 'points': [landmarks]}

    # a = fs.put(file)
    return {'status': 200}


if __name__ == '__main__':
    app.run(debug=True, port=5002)