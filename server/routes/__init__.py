

"""
Initialize Flask blueprints.
"""

from flask import Flask
from .guest_book import guestbook_bp

def register_blueprints(app):
    """
    Register all Flask blueprints with the Flask app.
    """
    app.register_blueprint(guestbook_bp)
