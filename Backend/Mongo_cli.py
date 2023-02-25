from bson import ObjectId
from pymongo import MongoClient, ReturnDocument

class MongoCli(object):
    def __init__(self):
        self.client = MongoClient("mongodb://localhost:27017/")
        self.db = self.client['context_user']
        self.collection = self.db['context_user']
    
    def insert_data(self, data, _id, topic):
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
                
    def find_documents(self, limit=5):
        return self.collection.find().limit(limit)

    
    def generate_unique_id():
        return ObjectId()

    # mongoc = MongoCli()
    """_id = generate_unique_id()
    data = {​​​​​​​​'id': _id, 'NAME': 'DEFAULT', 'FOCUS_GAZE': False, 'FOCUS_HEAD_ORIENTATION': False, 'FOCUS_PROXEMICS': False,
            'FOCUS_SPEECH': False, "AGENT": ""}​​​​​​​​
    mongoc.insert_data(data=data, _id=_id, topic="USER_CONTEXT_FOCUS")"""


