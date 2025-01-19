from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB URI from the environment variables
MONGODB_URI = os.getenv("MONGODB_URI")

# Connect to MongoDB
client = MongoClient(MONGODB_URI)

# Access the database
db = client["test"]

# Access a collection
collection = db["test_collection"]

# Insert a document
document = {"name": "Alice", "age": 25}
collection.insert_one(document)

# Query the document
found_user = collection.find_one({"name": "Alice"})
print(found_user)
