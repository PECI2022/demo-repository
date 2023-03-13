from flask import Flask, send_from_directory, request, make_response
from flask_cors import CORS
from werkzeug.datastructures import FileStorage
from pymongo import MongoClient
from gridfs import GridFS
import json
import os
from Mongo_cli import MongoCli

app = Flask(__name__)
mongo_cli = MongoCli()
fs = GridFS(mongo_cli.db)
CORS(app)


class Operations:
    def __init__(self): 
        pass

    def upload(self):
        file = request.files['file']    
        description = json.loads(request.form['description'])
        location = './' + description['name'] + '.webm'
        file.save(location)
        _id = mongo_cli.generate_unique_id()
        mongo_cli.insert_data(location,_id,"location")
        mongo_cli.insert_media_file(_id,location)
        os.remove(location)
        return "location"
    
    def list_videos(self):
        ret = []
        files = mongo_cli.collection.find()
        for f in files:
            ret.append(f['location'])
        return ret
    
    def download(self):
        fileName = request.get_json()['name']
        name = mongo_cli.generate_from_db(mongo_cli.collection.find_one({"location": fileName})['_id'])
        return name
    
operation = Operations()

@app.route('/')
def default():
    return "Running..."

@app.route('/upload', methods=['POST'])
def upload():
    print("UPLOAD")
    return operation.upload()

@app.route('/download', methods=['POST'])
def download():
    print("DOWNLOAD")
    return operation.download()

@app.route('/list_videos')
def list_videos():
    print("LIST")
    return operation.list_videos()

# audio 
@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    print("UPLOAD AUDIO")
    file = request.files['file']
    description = json.loads(request.form['description'])
    file.save('./'+description['name']+'.mp3')
    # a = fs.put(file)
    return {'status': 200}

@app.route('/download_audio', methods=['POST'])
def download_audio():
    print("DOWNLOAD AUDIO")
    # download audio to Backend folder
    fileName = request.get_json()['name']
    response = make_response()
    response.headers.add_header('Access-Control-Allow-Origin', '*')
    response.content_type = 'audio/mp3'
    with open("./"+fileName, "rb") as f:
        response.data = f.read()
    return response

@app.route('/list_audio')
def list_audio():
    print("LIST AUDIO")
    return [i for i in os.listdir('.') if i.endswith('.mp3')]

if __name__ == '__main__':
    app.run(debug=True, port=5001)

    # confirm that server is running
    # curl http://localhost:5001/
    





