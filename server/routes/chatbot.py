""" This module contains the chatbot route for the Flask server. """
# Import necessary modules
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

# Initialize MongoDB Collection
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

    # Retrieve the entire resume data from MongoDB
    try:
        resume_data = info_collection.find_one({"name": "Dhrumilkumar Patel"}, {"_id": 0})
        if not resume_data:
            context = "I don't have specific information about that."
        else:
            # Serialize resume_data into a string
            context = f"Name: {resume_data.get('name', '')}\n"

            contact = resume_data.get('contact', {})
            if contact:
                context += "Contact Information:\n"
                for key, value in contact.items():
                    context += f"  {key.capitalize()}: {value}\n"

            education = resume_data.get('education', [])
            if education:
                context += "Education:\n"
                for edu in education:
                    degree = edu.get('degree', '')
                    institution = edu.get('institution', '')
                    location = edu.get('location', '')
                    gpa = edu.get('gpa', '')
                    duration = edu.get('duration', '')
                    expected_graduation = edu.get('expected_graduation', '')

                    context += f"  {degree} at {institution}, {location}\n"
                    if gpa:
                        context += f"    GPA: {gpa}\n"
                    if duration:
                        context += f"    Duration: {duration}\n"
                    if expected_graduation:
                        context += f"    Expected Graduation: {expected_graduation}\n"

            skills = resume_data.get('skills', {})
            if skills:
                context += "Skills:\n"
                for category, skills_list in skills.items():
                    context += f"  {category}: {', '.join(skills_list)}\n"

            experience = resume_data.get('experience', [])
            if experience:
                context += "Experience:\n"
                for exp in experience:
                    title = exp.get('title', '')
                    company = exp.get('company', '')
                    location = exp.get('location', '')
                    duration = exp.get('duration', '')
                    responsibilities = exp.get('responsibilities', [])

                    context += f"  {title} at {company}, {location}\n"
                    if duration:
                        context += f"    Duration: {duration}\n"
                    for resp in responsibilities:
                        context += f"    - {resp}\n"

            projects = resume_data.get('projects', [])
            if projects:
                context += "Projects:\n"
                for proj in projects:
                    name = proj.get('name', '')
                    description = proj.get('description', '')
                    links = proj.get('links', {})

                    context += f"  {name}: {description}\n"
                    for link_name, link_url in links.items():
                        context += f"    {link_name}: {link_url}\n"

            honors_awards = resume_data.get('honors_awards', [])
            if honors_awards:
                context += "Honors and Awards:\n"
                for award in honors_awards:
                    title = award.get('title', '')
                    details = award.get('details', '')
                    link = award.get('link', '')

                    context += f"  {title}: {details}\n"
                    if link:
                        context += f"    Link: {link}\n"

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
            contents=prompt,  # Correct parameter name
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
