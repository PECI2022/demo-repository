from flask import Flask, send_from_directory, request, make_response
from flask_cors import CORS
from werkzeug.datastructures import FileStorage
<<<<<<< HEAD
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
        videos = mongo_cli.find_documents()
        return videos

operation = Operations()
=======
from pymongo import MongoClient
from gridfs import GridFS
import json
import os
from Mongo_cli import MongoCli

app = Flask(__name__)
mongo_cli = MongoCli()
fs = GridFS(mongo_cli.db)
CORS(app)
>>>>>>> main


class Operations:
    def __init__(self): 
        pass

    def upload(self):
        print(request.files)
        file = request.files['file']    
        description = json.loads(request.form['description'])
        if(self.check_existing_name(description['name'])):  
                return {"result": "Error"}
        info = './' + description['name'] + '.webm'
        file.save(info)
        _id = mongo_cli.generate_unique_id()
        # print("HERE")
        # print(str(_id))
        data = {"name":description['name'], "video_class":description['class'], "length":description['length'], "_id":str(_id)}
        mongo_cli.insert_data(data,_id,"info")
        mongo_cli.insert_media_file(_id,info)
        os.remove(info)
        return {"result": "Correct"}
    
    def list_videos(self):
        ret = []
        files = mongo_cli.collection.find()
        for f in files:
            ret.append(f['info'])
        print(ret)
        return ret
    
    def download(self):
        fileName = request.get_json()['name']
        name = mongo_cli.generate_from_db(mongo_cli.collection.find_one({"info": fileName})['_id'])
        return name
    
    def delete_video(self):
        description = json.loads(request.form['_id'])
        mongo_cli.delete_from_db(description['_id'])
        return "done"

    def check_existing_name(self,name):
        for i in mongo_cli.collection.find():
            if(name == i['info']['name']):
                return True
        return False
    
    
operation = Operations()

@app.route('/')
def default():
    return "Running..."


@app.route('/upload', methods=['POST'])
def upload():
<<<<<<< HEAD
    operation.upload()
    
=======
    print("UPLOAD")
    return operation.upload()

>>>>>>> main
@app.route('/download', methods=['POST'])
def download():
    print("DOWNLOAD")
    return operation.download()

@app.route('/list_videos')
def list_videos():
    print("LIST")
    return operation.list_videos()

@app.route('/delete_video', methods=['POST'])
def delete_video():
    print("DELETE")
    return operation.delete_video()

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

<<<<<<< HEAD
@app.route('/list_videos')
def list_videos():
    return operation.list_videos()
=======
@app.route('/list_audio')
def list_audio():
    print("LIST AUDIO")
    return [i for i in os.listdir('.') if i.endswith('.mp3')]
>>>>>>> main

if __name__ == '__main__':
    app.run(debug=True, port=5001)

    # confirm that server is running
    # curl http://localhost:5001/
    





