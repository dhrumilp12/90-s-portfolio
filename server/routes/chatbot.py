import os
import re
import logging
from flask import Blueprint, request, jsonify
from services.mongodb import MongoDBClient
import google.generativeai as genai  # Import the Google Generative AI library

# Configure logging for this module
logger = logging.getLogger(__name__)

# Initialize Blueprint
chatbot_bp = Blueprint('chatbot_bp', __name__)

# Initialize MongoDB Collection (assuming you have a collection with info about you)
db_client = MongoDBClient.get_client()
db = db_client[MongoDBClient.get_db_name()]
info_collection = db['resume']  # Ensure this collection exists and contains relevant data

# Gemini AI Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure the Google Generative AI library with your API key
genai.configure(api_key=GEMINI_API_KEY)

# Instantiate the model
model = genai.GenerativeModel('gemini-1.5-flash')  # Replace with your desired model name

def sanitize_input(text):
    """
    Basic sanitization to prevent XSS.
    Removes < and > characters.
    """
    return re.sub(r'[<>]', '', text)

@chatbot_bp.route('/chatbot', methods=['POST'])
def chatbot():
    """
    Handles chatbot interactions.
    Expects JSON with 'message' field.
    """
    data = request.get_json()
    if not data or 'message' not in data:
        logger.warning("No message received.")
        return jsonify({'error': 'No message provided.'}), 400

    user_message = sanitize_input(data['message'].strip())
    if not user_message:
        logger.warning("Empty message received.")
        return jsonify({'error': 'Empty message.'}), 400

    # RAG: Retrieve relevant information from MongoDB
    try:
        # Example: Search for keywords in user_message to fetch relevant info
        # This is a simplistic approach; consider using more advanced search/query mechanisms
        keywords = user_message.lower().split()
        query = {"$or": [{"content": {"$regex": keyword, "$options": "i"}} for keyword in keywords]}
        retrieved_info = list(info_collection.find(query, {"_id": 0, "content": 1}))

        # Compile retrieved information into a context string
        context = "\n".join([entry['content'] for entry in retrieved_info]) if retrieved_info else "I don't have specific information about that."

    except Exception as e:
        logger.error(f"Error retrieving data from MongoDB: {e}")
        context = "I'm sorry, I couldn't retrieve the information right now."

    # Prepare the prompt for Gemini AI
    prompt = f"""You are a friendly chatbot with knowledge about Dhrumilkumar Patel. You are the personal assistant of Dhrumilkumar Patel. You are asked to provide information about Dhrumilkumar Patel.
Use the following context to answer the user's question:
{context}

User: {user_message}
Chatbot:"""

    # Send request to Gemini AI using the model's generate_content method
   
    try:
        response = model.generate_content(
            contents=prompt,  # Replace 'prompt' with 'contents'
            generation_config=genai.GenerationConfig(
                max_output_tokens=150,
                temperature=0.7,
                stop_sequences=["\n", "User:", "Chatbot:"]
            )
        )

        chatbot_reply = response.text.strip()
        if not chatbot_reply:
            chatbot_reply = "I'm not sure how to respond to that."

        return jsonify({'reply': chatbot_reply}), 200

    except Exception as e:
        logger.error(f"Error communicating with Gemini AI: {e}")
        return jsonify({'error': 'Failed to generate response.'}), 500
