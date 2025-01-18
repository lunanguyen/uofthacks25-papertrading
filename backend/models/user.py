from backend.config import db
import bcrypt
from typing import Optional

# MongoDB Collection
users_collection = db["users"]

# Password hashing utility
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

# Password verification utility
def check_password(stored_hash: str, password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8"))

# Create a new user
def create_user(username: str, password: str, email: Optional[str] = None):
    hashed_password = hash_password(password)
    user = {
        "username": username,
        "password": hashed_password,
        "email": email,
        "tradingPortfolio": [],
    }
    result = users_collection.insert_one(user)
    return result.inserted_id

# Find user by username
def get_user_by_username(username: str):
    return users_collection.find_one({"username": username})

# Update user profile (trading portfolio, email, etc.)
def update_user_profile(username: str, email: Optional[str], trading_portfolio: Optional[list]):
    update_data = {}
    if email:
        update_data["email"] = email
    if trading_portfolio is not None:
        update_data["tradingPortfolio"] = trading_portfolio

    result = users_collection.update_one(
        {"username": username}, 
        {"$set": update_data}
    )
    return result.modified_count
