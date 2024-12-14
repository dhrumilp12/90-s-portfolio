

"""
Guestbook route module.
Handles GET and POST requests for the guestbook feature.
"""

import re
from flask import Blueprint, request, jsonify
from services.mongodb import MongoDBClient
import logging
import pymongo 

# Configure logging for this module
logger = logging.getLogger(__name__)

# Initialize Blueprint
guestbook_bp = Blueprint('guestbook_bp', __name__)

# Initialize MongoDB Collection
db_client = MongoDBClient.get_client()
db = db_client[MongoDBClient.get_db_name()]
guestbook_collection = db['guestbook']

def sanitize_input(text):
    """
    Basic sanitization to prevent XSS.
    Removes < and > characters.
    """
    return re.sub(r'[<>]', '', text)

@guestbook_bp.route('/guestbook', methods=['GET', 'POST'])
def handle_guestbook():
    """
    Handles GET and POST requests for the guestbook.
    POST: Adds a new entry to the guestbook.
    GET: Retrieves all guestbook entries.
    """
    if request.method == 'POST':
        data = request.get_json()
        if not data:
            logging.warning("No JSON data received.")
            return jsonify({'error': 'Invalid input.'}), 400

        name = sanitize_input(data.get('name', '').strip())
        message = sanitize_input(data.get('message', '').strip())

        if not name or not message:
            logging.warning("Name or message missing in the request.")
            return jsonify({'error': 'Name and message are required.'}), 400

        entry = {
            'name': name,
            'message': message
        }

        try:
            # Insert entry with retries
            def insert_operation():
                guestbook_collection.insert_one(entry)

            MongoDBClient.execute_with_retries(insert_operation)
            logging.info(f"New guestbook entry added by {name}.")
            return jsonify({'message': 'Entry added successfully!'}), 201
        except Exception as e:
            logging.error(f"Failed to add guestbook entry: {e}")
            return jsonify({'error': 'Failed to add entry.'}), 500

    elif request.method == 'GET':
        try:
            # Retrieve entries sorted by newest first
            def fetch_operation():
                return list(guestbook_collection.find({}, {'_id': 0}).sort('_id', pymongo.DESCENDING))

            entries = MongoDBClient.execute_with_retries(fetch_operation)
            logging.info("Guestbook entries retrieved successfully.")
            return jsonify(entries), 200
        except Exception as e:
            logging.error(f"Failed to retrieve guestbook entries: {e}")
            return jsonify({'error': 'Failed to retrieve entries.'}), 500

@guestbook_bp.route('/hit-counter', methods=['GET'])
def hit_counter():
    try:
        # Assume a separate collection for counters
        counters_collection = db['counters']
        counter = counters_collection.find_one_and_update(
            {'_id': 'site_hits'},
            {'$inc': {'count': 1}},
            upsert=True,
            return_document=pymongo.ReturnDocument.AFTER
        )
        logger.info(f"Hit counter updated to {counter['count']}.")
        return jsonify({'count': counter['count']}), 200
    except Exception as e:
        logger.error(f"Failed to retrieve hit counter: {e}")
        return jsonify({'error': 'Failed to retrieve hit counter.'}), 500