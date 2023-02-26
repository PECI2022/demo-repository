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

# https://techvidvan.com/tutorials/hand-gesture-recognition-tensorflow-opencv/

from threading import Thread

client = MongoClient("mongodb://localhost:27017")
db = client['peci']
collection = db.test_collection
collection.insert_one({"test":"big string"})
#fs = gridfs.GridFS(db)

mpHands = mp.solutions.hands
hands = mpHands.Hands(max_num_hands=1, min_detection_confidence=0.7)
mpDraw = mp.solutions.drawing_utils

model = load_model('models/mp_hand_gesture')
classNames = ['okay','peace','thumbs up','thumbs down','call me','stop','rock','live long','fist','smile']

def calculateVideo(fileName):
    cap = cv2.VideoCapture('./'+fileName)
    results = {}
    while True:
        ret, frame = cap.read()

        if not ret:
            break

        x, y, c = frame.shape

        # Flip the frame vertically
        frame = cv2.flip(frame, 1)
        #framergb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

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
                mpDraw.draw_landmarks(frame, handslms, mpHands.HAND_CONNECTIONS)

                # Predict gesture
                prediction = model.predict([landmarks])
                # print(prediction)
                classID = np.argmax(prediction)
                className = classNames[classID]

        if className in results:
            results[className]+=1
        else:
            results[className] = 1
        
        # if className!="": 
        #     print(className)

    print("RESULTS",results)
    return

app = Flask(__name__)
CORS(app)

@app.route('/')
def default():
    return "Running..."

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['file']
    description = json.loads(request.form['description'])
    file.save('./'+description['name']+'.webm')
    # a = fs.put(file)
    return {'status': 200}

@app.route('/download', methods=['POST'])
def download():
    fileName = request.get_json()['name']
    response = make_response()
    response.headers.add_header('Access-Control-Allow-Origin', '*')
    response.content_type = 'video/webm'

    t = Thread(target=calculateVideo, args=[fileName])
    t.start()

    with open("./"+fileName, "rb") as f:
        print(f)
        response.data = f.read()
    return response

@app.route('/list_videos')
def list_videos():
    return [i for i in os.listdir('.') if i.endswith('.webm')]

if __name__ == '__main__':
    app.run(debug=True, port=5001)


