import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# MongoDB URI from environment variable
MONGO_URI = os.getenv("MONGO_URI")

# Initialize MongoDB client
client = MongoClient(MONGO_URI)

# Database and Collection references
db = client["ProspecTrade"]
users_collection = db["users"]