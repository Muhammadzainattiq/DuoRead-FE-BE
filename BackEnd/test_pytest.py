"""
DuoRead API Pytest Test Suite
Run with: pytest test_pytest.py -v
"""

import pytest
import requests
import json
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "pytest@duoread.com"
TEST_PASSWORD = "testpassword123"
TEST_NAME = "Pytest User"
TEST_NATIVE_LANGUAGE = "English"

class TestDuoReadAPI:
    """Test class for DuoRead API"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for tests"""
        # First try to signup
        signup_data = {
            "name": TEST_NAME,
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "native_language": TEST_NATIVE_LANGUAGE
        }
        
        try:
            response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
            if response.status_code == 200:
                return response.json()["access_token"]
        except:
            pass
        
        # If signup fails, try login
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def headers(self, auth_token):
        """Get headers with authentication"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_health_check(self):
        """Test basic health check"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        assert response.text == '"API is working"'
    
    def test_signup(self):
        """Test user signup"""
        signup_data = {
            "name": "Test Signup User",
            "email": "signup@duoread.com",
            "password": "testpassword123",
            "native_language": "English"
        }
        
        response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data
        assert "user_id" in data
        assert data["user"]["name"] == "Test Signup User"
    
    def test_login(self):
        """Test user login"""
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == TEST_EMAIL
    
    def test_protected_endpoint_without_auth(self):
        """Test that protected endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/books/")
        assert response.status_code == 401
    
    def test_list_books_authenticated(self, headers):
        """Test listing books with authentication"""
        response = requests.get(f"{BASE_URL}/books/", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "books" in data
        assert "total_books" in data
    
    def test_get_user_profile(self, headers):
        """Test getting user profile"""
        # First get user_id from login
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        user_id = login_response.json()["user_id"]
        
        response = requests.get(f"{BASE_URL}/auth/user/{user_id}", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == TEST_NAME
        assert data["email"] == TEST_EMAIL
    
    def test_chat_without_book(self, headers):
        """Test chat functionality without book context"""
        chat_data = {
            "message": "Hello, this is a test message",
            "context": "Testing chat functionality"
        }
        
        response = requests.post(f"{BASE_URL}/api/chat", json=chat_data, headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "response" in data
        assert data["agent_type"] == "book"
        assert len(data["response"]) > 0
    
    def test_get_chat_history(self, headers):
        """Test getting chat history"""
        response = requests.get(f"{BASE_URL}/api/chatHistory", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "history" in data
        assert data["agent_type"] == "book"
        assert isinstance(data["history"], list)
    
    def test_invalid_book_access(self, headers):
        """Test accessing non-existent book"""
        fake_book_id = "00000000-0000-0000-0000-000000000000"
        response = requests.get(f"{BASE_URL}/books/{fake_book_id}", headers=headers)
        assert response.status_code == 404
    
    def test_book_status_nonexistent(self, headers):
        """Test book status for non-existent book"""
        fake_book_id = "00000000-0000-0000-0000-000000000000"
        response = requests.get(f"{BASE_URL}/books/{fake_book_id}/status", headers=headers)
        assert response.status_code == 404
    
    def test_invalid_token(self):
        """Test with invalid JWT token"""
        invalid_headers = {"Authorization": "Bearer invalid.token.here"}
        response = requests.get(f"{BASE_URL}/books/", headers=invalid_headers)
        assert response.status_code == 401
    
    def test_token_refresh(self):
        """Test token refresh functionality"""
        # First login to get refresh token
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        refresh_token = login_response.json()["refresh_token"]
        
        # Test refresh
        refresh_data = {"refresh_token": refresh_token}
        response = requests.post(f"{BASE_URL}/auth/refresh", json=refresh_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data
        assert "refresh_token" in data
    
    def test_token_verification(self, headers):
        """Test token verification"""
        # Get current token from headers
        token = headers["Authorization"].replace("Bearer ", "")
        
        verify_data = {"access_token": token}
        response = requests.post(f"{BASE_URL}/auth/verify", json=verify_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["valid"] is True
    
    def test_chat_with_book_context(self, headers):
        """Test chat with book context (should work even without actual book)"""
        chat_data = {
            "message": "Tell me about this book",
            "book_id": "00000000-0000-0000-0000-000000000000"  # Non-existent book
        }
        
        response = requests.post(f"{BASE_URL}/api/chat", json=chat_data, headers=headers)
        # Should still work, just won't have book context
        assert response.status_code == 200
        
        data = response.json()
        assert "response" in data
        assert data["agent_type"] == "book"
    
    def test_delete_chat_history(self, headers):
        """Test deleting chat history"""
        delete_data = {
            "book_id": "00000000-0000-0000-0000-000000000000"
        }
        
        response = requests.delete(f"{BASE_URL}/api/chat", json=delete_data, headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert data["agent_type"] == "book"

# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
