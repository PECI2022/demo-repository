from bson import ObjectId
import gridfs
from pymongo import MongoClient, ReturnDocument

class MongoCli(object):
    def __init__(self):
        self.client = MongoClient("mongodb://localhost:27017/")
        self.db = self.client['context_user']
        self.collection = self.db['context_user']
        self.features = self.db['features'] 
    
    def insert_data(self, data, _id, topic):
        print(id)
        if not self.find_project(_id):
            try:
                doc = self.collection.insert_one({'_id': ObjectId(_id), topic: data})
            except Exception as e:
                print(f'\n[x] ERROR - INSERTED [x]: {e}')
            else:
                print('\n[!] INSERTED [!]')
                return doc.inserted_id
        else:
            try:
                self.collection.find_one_and_update(
                    {'_id': ObjectId(_id)},
                    {'$set': {topic: data}},
                    return_document=ReturnDocument.AFTER,
                )
            except Exception as e:
                print(f'\n[x] ERROR - ADD NEW VALUES [x]: {e}')
            else:
                print('\n[!] ADD NEW VALUES [!]')

    def insert_feature(self, data, _id, topic):
        print(id)
        if not self.find_feature(_id):
            try:
                doc = self.features.insert_one({'_id': ObjectId(_id), topic: data})
            except Exception as e:
                print(f'\n[x] ERROR - INSERTED [x]: {e}')
            else:
                print('\n[!] INSERTED [!]')
                return doc.inserted_id
        else:
            try:
                self.features.find_one_and_update(
                    {'_id': ObjectId(_id)},
                    {'$set': {topic: data}},
                    return_document=ReturnDocument.AFTER,
                )
            except Exception as e:
                print(f'\n[x] ERROR - ADD NEW VALUES [x]: {e}')
            else:
                print('\n[!] ADD NEW VALUES [!]')

    def find_project(self, _id):
        projects = self.collection.find()
        for project in projects:
            if project['info']['_id'] == _id:
                return project['info']
        return False
    
    def find_feature(self, _id):
        projects = self.features.find()
        for project in projects:
            if project['info']['_id'] == _id:
                return project['info']
        return False
    
    def insert_in_project(self, project_id, data):
        project = self.find_project(project_id)
        print(data)
        if self.check_existing_name(project["content"], data["name"]):
            return {"result": "Error"}
        project["content"].append(data)
        print(project)
        self.insert_data(project,project['_id'],"info")
        return {"result": "Correct"}
    
    def delete_videos(self, project_id, videos_id):
        project = self.find_project(project_id)
        content = []
        for video in project['content']:
            if video['_id'] in videos_id:
                self.delete_from_db(video['_id'])
            else:
                content.append(video)
        project["content"] = content
        self.insert_data(project,project['_id'],"info")
        
    # def edit_class(self, project_id, video_id, new_class):
    #     project = self.find_project(project_id)
    #     content = []
    #     for video in project['content']:
    #         if video['_id'] != video_id:
    #             content.append(video)
    #         else:
    #             video['video_class'] = new_class
    #             content.append(video)
    #     project["content"] = content
    #     self.insert_data(project,project['_id'],"info")

    def edit(self, description):
        project = self.find_project(description.get('id'))
        content = []
        edit = description.get('edit')
        for video in project['content']:
            if video['_id'] != description['video_id']:
                content.append(video)
            else:
                video[edit] = description.get('new_elem')
                content.append(video)
        project['content'] = content
        self.insert_data(project,description.get('id'),"info")

    
    # def edit_name(self, project_id, video_id, new_name):
    #     project = self.find_project(project_id)
    #     content = []
    #     for video in project['content']:
    #         if video['_id'] != video_id:
    #             content.append(video)
    #         else:
    #             video['video_class'] = new_name
    #             content.append(video)
    #     project["content"] = content
    #     self.insert_data(project,project['_id'],"info")

    # def edit_description(self, project_id, description):
    #     project = self.find_project(project_id)
    #     project['subject'] = description
    #     self.insert_data(project,project['_id'],"info")

    # def change_privacy(self,project_id):
    #     project = self.find_project(project_id)
    #     privacy = project['privacy']
    #     if privacy == 1:
    #         privacy = 0
    #     else:
    #         privacy = 1
    #     project['privacy'] = privacy
    #     self.insert_data(project,project_id,"info")

    def list_video(self, project_id):
        project = self.find_project(project_id)
        videos = []
        for video in project["content"]:
            videos.append(video)
        return videos
    
    def list_project(self):
        projects = self.collection.find()
        ret = []
        for project in projects:
            ret.append(project["info"])
        return ret
    
    def check_existing_name(self, videos, name):
        for video in videos:
            if video["name"] == name:
                return True
        return False
    

    def insert_media_file(self, _id, file_location):
        name = file_location
        file_data = open(name, "rb")
        data = file_data.read()
        print("catch")
        print(file_data)
        fs = gridfs.GridFS(self.db)
        fs.put(data, filename=name, _id=_id)
        print("Inserted Media File: ", _id)

    def download_media_file(self, _id):
        fs = gridfs.GridFS(self.db)
        name = str(_id) + ".webm"
        out_data = fs.get(ObjectId(_id)).read()
        out = open(name, "wb")
        out.write(out_data)
        out.close()
        return name
    
    def delete_from_db(self,_id):
        self.collection.delete_one({'_id': ObjectId(_id)})
        fs = gridfs.GridFS(self.db)
        fs.delete(ObjectId(_id))
  
    
    def generate_from_db(self,_id):
        fs = gridfs.GridFS(self.db)
        f = fs.find_one({'_id': _id})
        # print(f.filename)
        return f.read()
        

    def check_if_media_exists(self, _id):
        fs = gridfs.GridFS(self.db)
        out_data = fs.find_one(ObjectId(_id))
        if out_data:
            return True
        return False
                
    def find_documents(self, limit=5):
        return self.collection.find().limit(limit)

    
    def generate_unique_id(self):
        return ObjectId()
    
    def find_document_by_id(self,_id):
            if self.collection.find_one(_id) == None:
                return False
            return True

    

    # mongoc = MongoCli()
    """_id = generate_unique_id()
    data = {​​​​​​​​'id': _id, 'NAME': 'DEFAULT', 'FOCUS_GAZE': False, 'FOCUS_HEAD_ORIENTATION': False, 'FOCUS_PROXEMICS': False,
            'FOCUS_SPEECH': False, "AGENT": ""}​​​​​​​​
    mongoc.insert_data(data=data, _id=_id, topic="USER_CONTEXT_FOCUS")"""

