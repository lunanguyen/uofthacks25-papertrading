from fastapi import FastAPI
from backend.routers import user_routes

app = FastAPI()

# Include the user routes
app.include_router(user_routes.router)