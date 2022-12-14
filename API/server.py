from flask import Flask, send_from_directory, request, make_response
from flask_cors import CORS
from werkzeug.datastructures import FileStorage
from pymongo import MongoClient
import gridfs
import json
import os

client = MongoClient("mongodb://localhost:27017")
db = client['peci']
fs = gridfs.GridFS(db)

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
    with open("./"+fileName, "rb") as f:
        response.data = f.read()
    return response

@app.route('/list_videos')
def list_videos():
    return [i for i in os.listdir('.') if i.endswith('.webm')]

if __name__ == '__main__':
    app.run(debug=True, port=5000)