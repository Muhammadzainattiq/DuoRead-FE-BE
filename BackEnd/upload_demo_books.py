#!/usr/bin/env python3
"""
Script to upload demo books that everyone can access.
This script uploads "The Word Alchemist.pdf" and "Pride and Prejudice.pdf" as demo books.
"""

import os
import uuid
import logging
import asyncio
from typing import List
from concurrent.futures import ThreadPoolExecutor
from sqlmodel import Session, select
from models.database_models import Book, PDFFile
from configurations.postgres_db import get_db
from utils.vector_database_builder import VectorDatabaseBuilder
from utils.language_detection import detect_book_language, get_language_name
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a thread pool executor for CPU-intensive tasks
thread_pool = ThreadPoolExecutor(max_workers=2, thread_name_prefix="demo_book_processing")

def _process_demo_book_embeddings_sync(book_id: str, pdf_path: str, title: str) -> bool:
    """
    Synchronous function to process PDF embeddings for demo books.
    This runs in a separate thread to avoid blocking the event loop.
    """
    try:
        logger.info(f"🔄 Starting background processing for demo book: {title} (ID: {book_id})")
        
        # Process the PDF book embeddings
        vector_builder = VectorDatabaseBuilder()
        success = vector_builder.process_pdf_book_embeddings_only(
            book_id=book_id,
            pdf_path=pdf_path
        )
        
        if success:
            logger.info(f"✅ Background processing completed for demo book: {title} (ID: {book_id})")
        else:
            logger.error(f"❌ Background processing failed for demo book: {title} (ID: {book_id})")
        
        return success
        
    except Exception as e:
        logger.error(f"❌ Error processing demo book embeddings: {e}")
        return False

async def process_demo_book_embeddings_background(book_id: str, pdf_path: str, title: str):
    """
    Background task to process PDF embeddings for demo books.
    """
    try:
        # Run the CPU-intensive work in a thread pool
        loop = asyncio.get_event_loop()
        success = await loop.run_in_executor(
            thread_pool,
            _process_demo_book_embeddings_sync,
            book_id,
            pdf_path,
            title
        )
        
        if success:
            logger.info(f"✅ Demo book '{title}' is now fully indexed and ready for use!")
        else:
            logger.error(f"❌ Demo book '{title}' indexing failed!")
            
    except Exception as e:
        logger.error(f"❌ Error in background processing for demo book '{title}': {e}")

def upload_demo_book(pdf_path: str, title: str, description: str = None) -> str:
    """
    Upload a demo book to the database.
    Returns the book ID.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    # Generate a special demo user ID (using a fixed UUID for demo books)
    demo_user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    
    # Read PDF content
    with open(pdf_path, "rb") as file:
        pdf_content = file.read()
    
    file_size = len(pdf_content)
    file_name = os.path.basename(pdf_path)
    
    # Get database session
    db = next(get_db())
    
    try:
        # Detect book language
        try:
            book_language = detect_book_language(pdf_path)
            language_name = get_language_name(book_language)
            logger.info(f"📖 Detected language for '{title}': {language_name}")
        except Exception as e:
            logger.warning(f"⚠️ Could not detect language for '{title}': {e}")
            book_language = "en"
        
        # Create book record
        book_id = uuid.uuid4()
        book = Book(
            id=book_id,
            user_id=demo_user_id,
            title=title,
            description=description,
            book_language=book_language,
            is_demo=True  # Mark as demo book
        )
        
        db.add(book)
        db.commit()
        db.refresh(book)
        
        logger.info(f"📚 Created demo book record: {title} (ID: {book_id})")
        
        # Save PDF file
        pdf_file = PDFFile(
            book_id=book_id,
            file_name=file_name,
            file_size=file_size,
            pdf_data=pdf_content
        )
        
        db.add(pdf_file)
        db.commit()
        
        logger.info(f"💾 Saved PDF file for demo book: {title}")
        
        # Start background processing for embeddings
        logger.info(f"🔄 Starting background processing for demo book: {title}")
        try:
            # Process embeddings synchronously for demo books
            success = _process_demo_book_embeddings_sync(str(book_id), pdf_path, title)
            if success:
                logger.info(f"✅ Demo book '{title}' is now fully indexed and ready for use!")
            else:
                logger.error(f"❌ Demo book '{title}' indexing failed!")
        except Exception as e:
            logger.error(f"❌ Error processing embeddings for demo book '{title}': {e}")
        
        return str(book_id)
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error uploading demo book '{title}': {e}")
        raise
    finally:
        db.close()

def main():
    """
    Main function to upload demo books.
    """
    logger.info("🚀 Starting demo books upload process...")
    
    # Define demo books
    demo_books = [
        {
            "pdf_path": "The Word Alchemist.pdf",
            "title": "The Word Alchemist",
            "description": "A comprehensive guide to mastering language and communication skills. This demo book showcases advanced vocabulary, literary techniques, and effective writing strategies."
        },
        {
            "pdf_path": "Pride and Prejudice.pdf", 
            "title": "Pride and Prejudice",
            "description": "Jane Austen's classic novel exploring themes of love, class, and social expectations in Regency England. A perfect example of English literature and historical context."
        }
    ]
    
    uploaded_books = []
    
    for book_info in demo_books:
        try:
            logger.info(f"📤 Uploading demo book: {book_info['title']}")
            book_id = upload_demo_book(
                pdf_path=book_info["pdf_path"],
                title=book_info["title"],
                description=book_info["description"]
            )
            uploaded_books.append({
                "title": book_info["title"],
                "id": book_id
            })
            logger.info(f"✅ Successfully uploaded demo book: {book_info['title']} (ID: {book_id})")
            
        except Exception as e:
            logger.error(f"❌ Failed to upload demo book '{book_info['title']}': {e}")
    
    logger.info("🎉 Demo books upload process completed!")
    logger.info(f"📊 Uploaded {len(uploaded_books)} demo books:")
    for book in uploaded_books:
        logger.info(f"   - {book['title']} (ID: {book['id']})")
    
    logger.info("💡 Demo books are now accessible to all users!")
    logger.info("🔄 Background indexing is in progress - books will be fully searchable shortly.")

if __name__ == "__main__":
    main()
