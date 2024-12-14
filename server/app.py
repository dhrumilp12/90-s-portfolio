"""
Flask application entry point.
"""

# Import necessary modules
import os
from flask import Flask
from routes import register_blueprints
from flask_cors import CORS
from dotenv import load_dotenv
import logging


# Load environment variables
load_dotenv()

def create_app():
    """
    Create and configure the Flask application.
    """
    app = Flask(__name__)


    # Retrieve FRONTEND_ORIGIN and split into a list
    frontend_origins = os.getenv("FRONTEND_ORIGIN", "").split(',')
    frontend_origins = [origin.strip() for origin in frontend_origins if origin.strip()]
    
    cors_config = {
        r"*": {
            "origins": frontend_origins,
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": [
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "X-CSRF-Token"
            ],
            "supports_credentials": True  # Allow sending cookies
        }
    }
    CORS(app, resources=cors_config)

    # Register blueprints
    register_blueprints(app)

    # Configure logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    logger.info("Flask application initialized.")

    return app

# Run the application
if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
