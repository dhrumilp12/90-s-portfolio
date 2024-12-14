

"""
This module contains the MongoDBClient class responsible for handling all MongoDB operations.
Classes:
    MongoDBClient: A client class for interacting with MongoDB.
Methods:
    get_mongodb_variables(): Retrieves MongoDB connection string from environment variables.
    get_client(): Returns a MongoDB client instance.
    get_db_name(): Returns the database name based on the current environment.
    execute_with_retries(operation, max_retries=5): Executes a given operation with retries.
"""

import os
import time
import random
import logging
import pymongo
from pymongo.errors import BulkWriteError, WriteError
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()  # Load environment variables from .env

class MongoDBClient:
    _client = None
    _db_name = None

    @staticmethod
    def get_mongodb_variables():
        CONNECTION_STRING = os.getenv("DB_CONNECTION_STRING")
        if not CONNECTION_STRING:
            logger.error("MongoDB connection string not found in environment variables.")
            raise EnvironmentError("DB_CONNECTION_STRING not set in environment variables.")
        return CONNECTION_STRING

    @classmethod
    def get_client(cls):
        if cls._client is None:
            CONNECTION_STRING = cls.get_mongodb_variables()
            cls._client = pymongo.MongoClient(CONNECTION_STRING)
            logger.info("MongoDB client initialized.")
        return cls._client

    @classmethod
    def get_db_name(cls):
        if cls._db_name is None:
            ENV = os.getenv("FLASK_ENV", "development")
            APP_NAME = os.getenv("APP_NAME", "retro_hackathon")
            cls._db_name = f"{APP_NAME}-{ENV}"
            logger.info(f"Database name set to: {cls._db_name}")
        return cls._db_name

    @staticmethod
    def execute_with_retries(operation, max_retries=5):
        retries = 0
        while retries < max_retries:
            try:
                return operation()
            except (BulkWriteError, WriteError) as e:
                retry_after_ms = 100  # Default retry interval
                if hasattr(e, 'details') and 'RetryAfterMs' in str(e):
                    retry_after_ms = int(re.findall(r"RetryAfterMs=(\d+)", str(e))[0])
                sleep_time = max(retry_after_ms / 1000.0, 1.0) + random.uniform(0.05, 0.1)
                logger.warning(f"Write error occurred: {e}. Retrying after {sleep_time} seconds...")
                time.sleep(sleep_time)
                retries += 1
            except Exception as e:
                logger.error(f"Error during operation: {e}")
                raise
        logger.error("Maximum retries exceeded.")
        raise Exception("Maximum retries exceeded.")
