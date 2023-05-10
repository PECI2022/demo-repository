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
import inspect

import features.index as featuresIndex
from data_characteristics import *
# from features.mediapipe_handgesture.mediapipe_handgesture import Mediapipe_handgesture

app = Flask(__name__)
mongo_cli = MongoCli()
# pipe = Mediapipe_handgesture()
fs = GridFS(mongo_cli.db)
CORS(app)


class Operations:
    def __init__(self):
        pass

    def new_project(self):
        description = json.loads(request.form['description'])
        _id = mongo_cli.generate_unique_id()
        data = {"name": description['name'], "subject": description['subject'], "model": description['model'],
                "category": description['category'], "content": [], "_id": str(_id), "update": datetime.now(), "privacy": 0, "features": []}
        mongo_cli.insert_data(data, _id, "info")
        return {"result": str(_id)}

    def delete_project(self, project_id):
        project = mongo_cli.find_project(project_id)
        if project:
            for feature in project['features']:
                mongo_cli.delete_feature_db(feature)
            videos = []
            for video in project['content']:
                videos.append(video['_id'])
            mongo_cli.delete_videos(project_id, videos)
            mongo_cli.delete_from_db(project_id)
            return {"result": "Project deleted successfully"}
        else:
            return {"result": "Project not found"}

    def upload(self):
        file = request.files['file']
        description = json.loads(request.form['description'])
        # if(self.check_existing_name(description['name'])):
        #         return {"result": "Error"}
        info = './' + description['name'] + '.webm'
        file.save(info)

        contrast = get_contrast(info)
        brightness = get_brightness(info)
        sharpness = get_sharpness(info)
        saturation = get_saturation(info)
        hue = get_hue(info)

        video_characteristics = {"contrast" : contrast, "brightness" : brightness, "sharpness" : sharpness, "saturation" : saturation, "hue" : hue}

        _id = mongo_cli.generate_unique_id()
        video_class = description.get('class')
        video_length = description.get('length')
        data = {"name": description['name'], "video_class": video_class, "length": video_length, "_id": str(
            _id), "update": datetime.now(), "MediaPipeHand": 0, "Characteristics": video_characteristics,"old_id":0}
            
        # mongo_cli.insert_data(data,_id,"info")
        mongo_cli.insert_media_file(_id, info)
        os.remove(info)
        return mongo_cli.insert_in_project(description['id'], data)
        # self.insert_into_project(str(_id),description['project_id'])
        # self.insert_in_project(description['id'],data)

    def update(self):
        description = json.loads(request.form['description'])
        pid = description['pid']
        project = mongo_cli.find_project(pid)
        for fid in project['features']:
            feature = mongo_cli.find_feature(fid)
            for vid in feature['data']:
                print(vid)
                video = mongo_cli.find_old_video(vid['video_id'],pid)
                vid['video_id'] = video['_id']
                if video[feature['class']] == 0:
                    d = {
                        'id': pid, 'edit': feature['class'], 'video_id': vid['video_id'], 'new_elem': fid}
                    mongo_cli.edit(d)
        return "done"

    def upload_video(self, name, old_id, _id, pid, video_class, video_length, location):
        data = {"name": name, "video_class": "video_class", "length": "video_length", "_id": str(
            _id), "update": datetime.now(), "MediaPipeHand": 0, "Characteristics": {}, "old_id": str(old_id)}
        mongo_cli.insert_media_file(ObjectId(_id), location)
        os.remove(location)
        return mongo_cli.insert_in_project(pid, data)

    def upload_folder(self):
        file = request.files['file']
        description = json.loads(request.form['description'])
        old_id = description['vid']
        _id = mongo_cli.generate_unique_id()
        name = description['name']
        pid = description['pid']
        location = './' + name
        file.save(location)
        print(name)
        project = mongo_cli.find_project(pid)
        print("ERRTYRES")

        if name.endswith("webm") or name.endswith("mp4"):
            return self.upload_video(name, old_id, _id, pid, "description['video_class']", "description['video_length']", location)

        elif name == "features.json":
            print("FEATURES IMPORTED")
            os.system("mongoimport --db=context_user --collection=exportFeatures --file=features.json")
            for feature in mongo_cli.exportFeatures.find():
                print(feature['info'])
                feature['info']['_id'] = str(_id)
                mongo_cli.insert_feature(feature['info'],_id,"info")
            mongo_cli.exportFeatures.drop()
            # for feature in mongo_cli.features.find():
            #     if feature['info']['_id'] not in project['features']:
            project['features'].append(str(_id))
            mongo_cli.insert_data(project,pid,"info")
            os.remove(location)
            return "DONE"
        elif name == "context_user.json":
            print("FILES IMPORTED")
            os.system(
                "mongoimport --db=context_user --collection=context_user --file=context_user.json")
            os.remove(location)
            return "DONE"

    def export_project(self):
        description = json.loads(request.form['description'])
        pid = description['pid']
        project = mongo_cli.find_project(pid)
        mongo_cli.export_project(project)

        os.system("mongoexport --collection=export --db=context_user --out=export/context_user.json")
        os.system("mongoexport --collection=exportFeatures --db=context_user --out=export/features.json")

        for video in project['content']:
            mongo_cli.download_media_file(video['_id'])
            os.rename(video['_id']+".webm", 'export/'+video['_id']+".webm")

        mongo_cli.exportFeatures.drop()
        mongo_cli.export.drop()

        return "DONE"

    def new_feature(self):
        description = json.loads(request.form['description'])
        project = mongo_cli.find_project(description['pid'])
        _id = mongo_cli.generate_unique_id()

        if description['feature'] not in project['features']:
            project['features'].append(str(_id))
            mongo_cli.insert_data(project, project['_id'], "info")

        data = {"_id": str(_id), "name": description['name'], "class": description['feature'], "data": [
        ], "update": datetime.now()}
        mongo_cli.insert_feature(data, _id, "info")

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

            # if video['_id'] not in feature['data']:
            vid.remove(video)
            video_name = mongo_cli.download_media_file(video['_id'])
            print(feature['class'])
            featureFunc = getattr(featuresIndex, feature['class'])
            f = featureFunc(video_name)
            os.remove(video_name)
            f['video_id'] = video['_id']
            if f['type'] in ['points']:
                mongo_cli.insert_in_feature(feature['_id'],f)
            vid.append(video)

        # project['content'] = vid
        # mongo_cli.insert_data(project,project['_id'],"info")
        return "done"

    def get_features(self):
        description = json.loads(request.form['description'])
        project = mongo_cli.find_project(description['pid'])
        video_id = description['video_id']
        fid = description['fid']
        if fid not in project['features']:
            return None
        return mongo_cli.get_feature(fid, video_id)

    def get_public_projects(self):
        projects = mongo_cli.list_project()
        ret = []
        # print(projects)
        i = 0
        for project in projects:
            if i == 6:
                break
            if project['privacy'] == 0:
                ret.append(project)
            i += 1
        return ret

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
        print("DES",description)

        project = mongo_cli.find_project(description['pid'])

        avg_characteristics = average_characteristics_project(project['content'])

        if 'tags' in project:
            tags = project['tags']
        else:
            tags = []
        return {"name": project["name"], "description": project['subject'], "tags": tags, "category": project.get('category', ''), "characteristics": avg_characteristics}

    def update_tags(self):
        print("UPDATE TAGS")
        description = json.loads(request.form['description'])
        project = mongo_cli.find_project(description['pid'])
        project['tags'] = description['tags']  # Update the 'tags' field with the new tags
        mongo_cli.update_project(project)  # Save the updated project
        
        return "done"


    
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
        mongo_cli.delete_videos(
            description['project_id'], description['video_id'])
        return "done"
    
    def list_feature_videos(self):
        description = json.loads(request.form['description'])
        project_id = description['projectID']
        feature_id = description['featureID']
        return mongo_cli.list_feature_videos(project_id, feature_id)

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

@app.route('/update_tags', methods=['POST'])
def update_tags():
    print("UPDATE TAGS")
    return operation.update_tags()

@app.route('/delete_project/<project_id>', methods=['POST'])
def delete_project(project_id):
    print("PROJECT DELETED")
    return operation.delete_project(project_id)


@app.route('/upload', methods=['POST'])
def upload():
    print("UPLOAD")
    return operation.upload()


@app.route('/upload_folder', methods=['POST'])
def upload_folder():
    print("UPLOAD FOLDER")
    return operation.upload_folder()


@app.route('/export_project', methods=['POST'])
def export_project():
    print("EXPORTING")
    return operation.export_project()


@app.route('/update', methods=['POST'])
def update():
    print("UPDATED")
    return operation.update()


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


@app.route('/get_features', methods=['POST'])
def get_features():
    print("GET FEATURES")
    return operation.get_features()


@app.route('/get_public_projects')
def get_public_projects():
    print("PUBLICS")
    return operation.get_public_projects()


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

@app.route('/get_available_features', methods=['POST'])
def get_available_features():
    return featuresIndex.available

@app.route('/list_feature_videos', methods=['POST'])
def list_feature_videos():
    return operation.list_feature_videos()


if __name__ == '__main__':
    app.run(debug=True, port=5001)

    # confirm that server is running
    # curl http://localhost:5001/
    # curl http://localhost:5001/
