

"""
Initialize Flask blueprints.
"""
# Import necessary modules
from flask import Flask
from .guest_book import guestbook_bp
from .chatbot import chatbot_bp

# Define a function to register all blueprints
def register_blueprints(app):
    """
    Register all Flask blueprints with the Flask app.
    """
    app.register_blueprint(guestbook_bp)
    app.register_blueprint(chatbot_bp)
