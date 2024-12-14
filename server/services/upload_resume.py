""" This script uploads resume data to MongoDB. """

# Import necessary modules
import json
import os
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from mongodb import MongoDBClient  

# Configure MongoDB connection
db_client = MongoDBClient.get_client()
db = db_client[MongoDBClient.get_db_name()]
collection = db['resume']

def load_json(file_path):
    script_dir = os.path.dirname(__file__)
    full_path = os.path.join(script_dir, file_path)
    with open(full_path, 'r') as file:
        return json.load(file)

def upload_resume(data, collection):
    try:
        # Insert the resume data. Use upsert to update if the document already exists.
        result = collection.update_one(
            {"name": data["name"]},
            {"$set": data},
            upsert=True
        )
        if result.upserted_id:
            print(f"Resume uploaded for {data['name']}: {result.upserted_id}")
        else:
            print(f"Resume updated for {data['name']}.")
    except DuplicateKeyError:
        print(f"Resume for {data['name']} already exists.")

def main():
    resume_data = load_json('resume_data.json')  # Ensure this file is in the same directory as upload_resume.py
    upload_resume(resume_data,collection)

if __name__ == "__main__":
    main()