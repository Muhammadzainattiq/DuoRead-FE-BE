from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.health_check_routes import health_check_router
from routes.chat_routes import chat_router
from routes.auth_routes import auth_router
from routes.book_routes import book_router
from routes.sticky_note_routes import sticky_note_router
from configurations.postgres_db import create_tables
import logging

logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on application startup."""
    print("🚀 Starting application startup...")
    try:
        print("📊 Creating database tables...")
        create_tables()
        print("✅ Database tables created successfully!")
        logger.info("Application startup completed successfully")
    except Exception as e:
        print(f"❌ Error during application startup: {e}")
        logger.error(f"Error during application startup: {e}")
        raise

# Include all routers
app.include_router(auth_router)  # Authentication endpoints
app.include_router(book_router)  # Book management endpoints
app.include_router(sticky_note_router)  # Sticky notes endpoints
app.include_router(chat_router)  # Chat endpoints
app.include_router(health_check_router)  # Health check endpoints