from flask import Flask, send_from_directory, request, make_response
from flask_cors import CORS
from werkzeug.datastructures import FileStorage
from pymongo import MongoClient
from gridfs import GridFS
import json
import os
from Mongo_cli import MongoCli
from bson.objectid import ObjectId
from datetime import datetime
from features.mediapipe_handgesture.mediapipe_handgesture import Mediapipe_handgesture

app = Flask(__name__)
mongo_cli = MongoCli()
pipe = Mediapipe_handgesture()
fs = GridFS(mongo_cli.db)
CORS(app)


class Operations:
    def __init__(self): 
        pass

    def new_project(self):
        description = json.loads(request.form['description'])
        print("CATCH")
        _id = mongo_cli.generate_unique_id()
        data = {"name":description['name'], "subject": description['subject'], "model": description['model'], "category": description['category'], "content": [], "_id": str(_id), "update": datetime.now(), "privacy": 0, "features": []}
        print(data)
        mongo_cli.insert_data(data,_id,"info")
        return {"result": str(_id)}

    def upload(self):
        file = request.files['file']    
        description = json.loads(request.form['description'])
        # if(self.check_existing_name(description['name'])):  
        #         return {"result": "Error"}
        info = './' + description['name'] + '.webm'
        file.save(info)
        _id = mongo_cli.generate_unique_id()
        video_class = description.get('class')
        video_length = description.get('length')
        data = {"name":description['name'], "video_class":video_class, "length": video_length, "_id":str(_id), "update": datetime.now(), "MediaPipeHand": 0}
        # mongo_cli.insert_data(data,_id,"info")
        mongo_cli.insert_media_file(_id,info)
        os.remove(info)
        return mongo_cli.insert_in_project(description['id'], data)
        # self.insert_into_project(str(_id),description['project_id'])
        # self.insert_in_project(description['id'],data)

    def new_feature(self):
        description = json.loads(request.form['description'])
        project = mongo_cli.find_project(description['pid'])
        _id = mongo_cli.generate_unique_id()

        if description['feature'] not in project['features']:
            project['features'].append(str(_id))
            mongo_cli.insert_data(project,project['_id'],"info")

        data = {"_id": str(_id), "name": description['name'], "class": description['feature'], "data": [], "update": datetime.now()}
        mongo_cli.insert_feature(data,_id,"info")
        
        return "done"
    
    def list_features(self):
        description = json.loads(request.form['description'])
        return mongo_cli.list_features(description['pid'])

    def extract_features(self):
        description = json.loads(request.form['description'])
        project = mongo_cli.find_project(description['pid'])
        videos_id = description['videos']
        feature = mongo_cli.find_feature(description['feature'])
        vid = project['content']
        for video_id in videos_id:
            video = mongo_cli.find_video(video_id,description['pid'])

            if video['_id'] not in feature['data']:
                vid.remove(video)
                video_name = mongo_cli.download_media_file(video['_id'])
                f = str(pipe.getLandMarks(video_name))
                os.remove(video_name)
                content = {"video_id": video['_id'], "feature": f}
                mongo_cli.insert_in_feature(feature['_id'],content)
                video[feature['class']] = feature['_id']
                vid.append(video)

        project['content'] = vid
        mongo_cli.insert_data(project,project['_id'],"info")
        return "done"
    
    def download_features(self):
        description = json.loads(request.form['description'])
        project = mongo_cli.find_project(description['pid'])
        features = project['features']
        fileName = "features.json"
        with open(fileName, "w") as f:
            for feature in features:
                f.write(str(feature['video_id']))
                f.write("\n")
        return send_from_directory('./', fileName, as_attachment=True)
    
    # def load_checked_videos(self):
    #     description = json.loads(request.form['description'])
    #     feature = mongo_cli.find_feature(description['id'])
    #     checks = []
    #     for 
    
    def load_info(self):
        description = json.loads(request.form['description'])
        project = mongo_cli.find_project(description['pid'])
        tags = []
        for video in project['content']:
                tags.append(video['video_class'])
        return {"name": project["name"], "description": project['subject'], "tags": tags, "category": project['category']}
    
    # def edit_class(self):
    #     description = json.loads(request.form['description'])
    #     video_class = description.get('class')
    #     project_id = description.get('id')
    #     video_id = description.get('video')
    #     mongo_cli.edit_class(project_id,video_id,video_class)
    #     return "done"
    
    # def edit_name(self):
    #     description = json.loads(request.form['description'])
    #     video_name = description.get('name')
    #     project_id = description.get('id')
    #     video_id = description.get('video')
    #     mongo_cli.edit_name(project_id,video_id,video_name)
    #     return "done"
    
    # def edit_description(self):
    #     description = json.loads(request.form['description'])
    #     project_description = description.get('subject')
    #     project_id = description.get('id')
    #     mongo_cli.edit_description(project_id,project_description)
    #     return "done"
    
    # def change_privacy(self):
    #     description = json.loads(request.form['description'])
    #     project_id = description.get('id')
    #     mongo_cli.change_privacy(project_id)
    #     return "done"
    
    def edit_video(self):
        description = json.loads(request.form['description'])
        mongo_cli.edit(description)
        return "done"

    
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
        mongo_cli.delete_videos(description['project_id'], description['video_id'])
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

@app.route('/edit', methods=['POST'])
def edit():
    print("EDIT")
    return operation.edit_video()

@app.route('/download', methods=['POST'])
def download():
    print("DOWNLOAD")
    return operation.download()

@app.route('/load_info', methods=['POST'])
def load_info():
    print("INFO")
    return operation.load_info()

@app.route('/list_videos', methods=['POST'])
def list_videos():
    print("LIST")
    return operation.list_videos()

@app.route('/list_features', methods=['POST'])
def list_features():
    print("LIST_FEATURES")
    return operation.list_features()

@app.route('/list_projects')
def list_projects():
    print("PROJECTS")
    return operation.list_projects()

@app.route('/delete_video', methods=['POST'])
def delete_video():
    print("DELETE")
    return operation.delete_video()

@app.route('/new_feature', methods=['POST'])
def new_feature():
    print("NEW_FEATURE")
    return operation.new_feature()

@app.route('/extract_features', methods=['POST'])
def extract_features():
    print("FEATURES")
    return operation.extract_features()

@app.route('/download_features', methods=['POST'])
def download_features():
    print("DOWNLOAD FEATURES")
    return operation.download_features()

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
    





