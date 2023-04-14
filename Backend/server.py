from flask import Flask, render_template, send_from_directory, request, make_response
from flask_cors import CORS
from werkzeug.datastructures import FileStorage
from pymongo import MongoClient
from gridfs import GridFS
import json
import os
from Mongo_cli import MongoCli
from bson.objectid import ObjectId
from datetime import datetime

app = Flask(__name__)
mongo_cli = MongoCli()
fs = GridFS(mongo_cli.db)
CORS(app)


class Operations:
    def __init__(self): 
        pass

    def new_project(self):
        description = json.loads(request.form['description'])
        print("CATCH")
        _id = mongo_cli.generate_unique_id()
        data = {"name":description['name'], "subject": description['subject'], "model": description['model'], "category": description['category'], "content": [], "_id": str(_id), "update": datetime.now()}
        print(data)
        mongo_cli.insert_data(data,_id,"info")
        return {"result": str(_id)}

    def upload(self):
        print(request.files)
        file = request.files['file']    
        description = json.loads(request.form['description'])
        # if(self.check_existing_name(description['name'])):  
        #         return {"result": "Error"}
        info = './' + description['name'] + '.webm'
        file.save(info)
        _id = mongo_cli.generate_unique_id()
        video_class = description.get('class')
        video_length = description.get('length')
        data = {"name":description['name'], "video_class":video_class, "length": video_length, "_id":str(_id), "update": datetime.now()}
        # mongo_cli.insert_data(data,_id,"info")
        mongo_cli.insert_media_file(_id,info)
        os.remove(info)
        return mongo_cli.insert_in_project(description['id'], data)
        # self.insert_into_project(str(_id),description['project_id'])
        # self.insert_in_project(description['id'],data)
    
    # def insert_in_project(self, project_id, data):

    #     projects = mongo_cli.collection.find()
    #     for project in projects:
    #         if project['info']['_id'] == project_id:
    #             project["info"]["content"].append(data)
    #             print(project)
    #             return {"result": "Correct"}
    #     return {"result": "Error"}
    
    def list_videos(self):
        description = json.loads(request.form['id'])
        project_id = description['id']
        return mongo_cli.list_video(project_id)
    
    def list_projects(self):
        return mongo_cli.list_project()
    
    def download(self):
        return mongo_cli.generate_from_db(ObjectId(request.form['_id']))
    
    def delete_video(self):
        description = json.loads(request.form['_id'])
        # mongo_cli.delete_from_db(description['_id'])
        mongo_cli.delete_video(description['project_id'], description['video_id'])
        return "done"

    # def check_existing_name(self,name):
    #     for i in mongo_cli.collection.find():
    #         if(name == i['info']['name']):
    #             return True
    #     return False
    
    # def insert_into_project(self,project_id,video_id):
    #     project = mongo_cli.collection.find_one({'_id':project_id})
    #     project['content'].append(video_id)
    #     print(project)
    
    
operation = Operations()

@app.route('/')
def default():
    return "Running..."

@app.route('/new_project', methods=['POST'])
def new_project():
    print("NEW PROJECT")
    return operation.new_project()

@app.route('/upload', methods=['POST'])
def upload():
    print("UPLOAD")
    return operation.upload()

@app.route('/download', methods=['POST'])
def download():
    print("DOWNLOAD")
    return operation.download()

@app.route('/list_videos', methods=['POST'])
def list_videos():
    print("LIST")
    return operation.list_videos()

@app.route('/list_projects')
def list_projects():
    print("PROJECTS")
    return operation.list_projects()

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

@app.route('/list_audio')
def list_audio():
    print("LIST AUDIO")
    return [i for i in os.listdir('.') if i.endswith('.mp3')]

if __name__ == '__main__':
    app.run(debug=True, port=5001)

    # confirm that server is running
    # curl http://localhost:5001/
    





