from fastapi import FastAPI, Request, HTTPException
from requests_oauthlib import OAuth1Session
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Twitter credentials from environment variables
CONSUMER_KEY = os.getenv("TWITTER_API_KEY")
CONSUMER_SECRET = os.getenv("TWITTER_API_SECRET")
CALLBACK_URI = "http://localhost:8000/callback"

# Endpoint to start the OAuth process
@app.get("/login")
async def login():
    oauth = OAuth1Session(CONSUMER_KEY, client_secret=CONSUMER_SECRET)
    request_token_url = "https://api.twitter.com/oauth/request_token"
    data = oauth.fetch_request_token(request_token_url)
    request_token = data.get("oauth_token")
    request_token_secret = data.get("oauth_token_secret")

    # Store the request_token_secret in a secure way (e.g., in a session or database)
    
    # Redirect user to Twitter for authorization
    authorization_url = f"https://api.twitter.com/oauth/authorize?oauth_token={request_token}"
    return RedirectResponse(authorization_url)

# Callback endpoint to handle the response from Twitter
@app.get("/callback")
async def callback(oauth_token: str, oauth_verifier: str):
    # Retrieve the previously stored request_token_secret
    
    oauth = OAuth1Session(
        CONSUMER_KEY,
        client_secret=CONSUMER_SECRET,
        resource_owner_key=oauth_token,
        verifier=oauth_verifier
    )
    access_token_url = "https://api.twitter.com/oauth/access_token"
    oauth_tokens = oauth.fetch_access_token(access_token_url)

    # Authenticate user using oauth_tokens
    user_info = oauth.get("https://api.twitter.com/1.1/account/verify_credentials.json").json()

    return {"user_info": user_info}

