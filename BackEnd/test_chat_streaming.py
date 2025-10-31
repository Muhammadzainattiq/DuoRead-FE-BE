#!/usr/bin/env python3
"""
Test script to debug chat streaming endpoint
"""

import requests
import json
import sys

def test_chat_streaming():
    """Test the chat streaming endpoint"""
    print("🔍 Testing chat streaming endpoint")
    
    # Test data
    data = {
        "message": "Hello, how are you?",
        "context": "",
        "book_id": None
    }
    
    # You'll need to get a valid token first
    token = "your_jwt_token_here"  # Replace with actual token
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/books/chat/stream",
            json=data,
            headers=headers,
            stream=True,
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Error: {response.text}")
            return False
        
        print("📡 Streaming response:")
        print("-" * 50)
        
        chunk_count = 0
        for chunk in response.iter_lines(decode_unicode=True):
            if chunk:
                chunk_count += 1
                print(f"Chunk {chunk_count}: {chunk}")
                if chunk.strip() == "data: [DONE]":
                    print("✅ Stream completed successfully")
                    break
                elif chunk.startswith("data: Error:"):
                    print(f"❌ Stream error: {chunk}")
                    return False
        
        if chunk_count == 0:
            print("❌ No chunks received")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    print("⚠️ Note: You need to replace 'your_jwt_token_here' with a valid JWT token")
    print("Get a token by logging in through /auth/login endpoint first")
    test_chat_streaming()
