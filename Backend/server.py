from flask import Flask, send_from_directory, request, make_response
from flask_cors import CORS
from werkzeug.datastructures import FileStorage
import json
import os
from Mongo_cli import MongoCli
from gridfs import GridFS
app = Flask(__name__)

mongo_cli = MongoCli()
fs = GridFS(mongo_cli.db)
# client = MongoClient(MONGODB_URI)

class Operations:
    def __init__(self):
        pass

    
    def upload(self):
        print("Catch")
        # x = '{ "name":"John", "age":30, "city":"New York"}'
        # y = json.loads(x)
        file = request.files['file']
        description = json.loads(request.form['description'])
        file.save('./'+ description['name']+'.webm')
        file_id = fs.put(file)
        # id = mongo_cli.generate_unique_id()
        video_id = mongo_cli.insert_data(file,file_id,description)
        # a = fs.put(file)
        return video_id
    
    def list_videos(self):
        videos = mongo_cli.find_documents();
        return videos

operation = Operations()

@app.route('/')
def default():
    return "Running..."


@app.route('/upload', methods=['POST'])
def upload():
    operation.upload()
    
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
    return operation.list_videos()

if __name__ == '__main__':
    app.run(debug=True, port=5001)