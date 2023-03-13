from bson import ObjectId
import gridfs
from pymongo import MongoClient, ReturnDocument

class MongoCli(object):
    def __init__(self):
        self.client = MongoClient("mongodb://localhost:27017/")
        self.db = self.client['context_user']
        self.collection = self.db['context_user']
    
    def insert_data(self, data, _id, topic):
        print(id)
        if not self.find_document_by_id(_id):
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

