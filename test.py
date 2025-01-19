from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()  # Ensure your .env file is in the same directory as this script

# Get MongoDB URI from .env file
MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    print("Error: MONGODB_URI is not set in .env file.")
else:
    try:
        # Initialize MongoClient
        client = MongoClient(MONGODB_URI)
        
        # Test the connection by pinging the server
        client.admin.command('ping')
        print("Connected to MongoDB Atlas successfully!")

        # Optionally, list databases to confirm access
        print("Databases available:", client.list_database_names())
    except ConnectionFailure as e:
        print(f"Could not connect to MongoDB Atlas: {e}")
