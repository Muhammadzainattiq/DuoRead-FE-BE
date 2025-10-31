#!/usr/bin/env python3
"""
DuoRead API Auto Test Suite
Non-interactive version for automated testing
"""

import requests
import json
import time
import os
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "autotest@duoread.com"
TEST_PASSWORD = "testpassword123"
TEST_NAME = "Auto Test User"
TEST_NATIVE_LANGUAGE = "English"

class DuoReadAPITester:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.access_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message
        })
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, files: Dict = None, headers: Dict = None) -> requests.Response:
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}{endpoint}"
        
        # Add authentication header if token exists
        if self.access_token and headers is None:
            headers = {"Authorization": f"Bearer {self.access_token}"}
        elif self.access_token and headers:
            headers["Authorization"] = f"Bearer {self.access_token}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, params=data, headers=headers)
            elif method.upper() == "POST":
                if files:
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=headers)
            elif method.upper() == "DELETE":
                response = requests.delete(url, json=data, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None
    
    def test_health_check(self):
        """Test basic health check endpoint"""
        print("\n🏥 Testing Health Check...")
        
        response = self.make_request("GET", "/")
        if response and response.status_code == 200:
            self.log_test("Health Check", True, "API is responding")
            return True
        else:
            self.log_test("Health Check", False, f"Status: {response.status_code if response else 'No response'}")
            return False
    
    def test_signup(self):
        """Test user signup"""
        print("\n👤 Testing User Signup...")
        
        signup_data = {
            "name": TEST_NAME,
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "native_language": TEST_NATIVE_LANGUAGE
        }
        
        response = self.make_request("POST", "/auth/signup", data=signup_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("access_token"):
                self.access_token = data["access_token"]
                self.user_id = data["user_id"]
                self.log_test("User Signup", True, f"User created: {data.get('user', {}).get('name')}")
                return True
            else:
                self.log_test("User Signup", False, "Invalid response format")
                return False
        else:
            self.log_test("User Signup", False, f"Status: {response.status_code if response else 'No response'}")
            return False
    
    def test_login(self):
        """Test user login"""
        print("\n🔐 Testing User Login...")
        
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        
        response = self.make_request("POST", "/auth/login", data=login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("access_token"):
                self.access_token = data["access_token"]
                self.user_id = data["user_id"]
                self.log_test("User Login", True, f"Logged in: {data.get('user', {}).get('name')}")
                return True
            else:
                self.log_test("User Login", False, "Invalid response format")
                return False
        else:
            self.log_test("User Login", False, f"Status: {response.status_code if response else 'No response'}")
            return False
    
    def test_protected_endpoint_without_auth(self):
        """Test that protected endpoints require authentication"""
        print("\n🛡️ Testing Authentication Protection...")
        
        # Try to access protected endpoint without token
        response = self.make_request("GET", "/books/")
        
        if response and response.status_code == 401:
            self.log_test("Auth Protection", True, "Protected endpoint correctly requires authentication")
            return True
        else:
            self.log_test("Auth Protection", False, f"Expected 401, got: {response.status_code if response else 'No response'}")
            return False
    
    def test_list_books(self):
        """Test listing books (should be empty initially)"""
        print("\n📚 Testing List Books...")
        
        response = self.make_request("GET", "/books/")
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get("success") and "books" in data:
                book_count = len(data["books"])
                self.log_test("List Books", True, f"Found {book_count} books")
                return True
            else:
                self.log_test("List Books", False, "Invalid response format")
                return False
        else:
            self.log_test("List Books", False, f"Status: {response.status_code if response else 'No response'}")
            return False
    
    def test_get_user_profile(self):
        """Test getting user profile"""
        print("\n👤 Testing Get User Profile...")
        
        response = self.make_request("GET", f"/auth/user/{self.user_id}")
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get("name") == TEST_NAME and data.get("email") == TEST_EMAIL:
                self.log_test("Get User Profile", True, f"Profile retrieved: {data.get('name')}")
                return True
            else:
                self.log_test("Get User Profile", False, "Profile data mismatch")
                return False
        else:
            self.log_test("Get User Profile", False, f"Status: {response.status_code if response else 'No response'}")
            return False
    
    def test_chat_without_book(self):
        """Test chat functionality without book context"""
        print("\n💬 Testing Chat (No Book Context)...")
        
        chat_data = {
            "message": "Hello, how are you?",
            "context": "This is a test message"
        }
        
        response = self.make_request("POST", "/api/chat", data=chat_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get("response") and data.get("agent_type") == "book":
                self.log_test("Chat (No Book)", True, "Chat response received")
                return True
            else:
                self.log_test("Chat (No Book)", False, "Invalid response format")
                return False
        else:
            self.log_test("Chat (No Book)", False, f"Status: {response.status_code if response else 'No response'}")
            return False
    
    def test_get_chat_history(self):
        """Test getting chat history"""
        print("\n📜 Testing Get Chat History...")
        
        response = self.make_request("GET", "/api/chatHistory")
        
        if response and response.status_code == 200:
            data = response.json()
            if "history" in data and data.get("agent_type") == "book":
                history_count = len(data["history"])
                self.log_test("Get Chat History", True, f"Found {history_count} messages in history")
                return True
            else:
                self.log_test("Get Chat History", False, "Invalid response format")
                return False
        else:
            self.log_test("Get Chat History", False, f"Status: {response.status_code if response else 'No response'}")
            return False
    
    def test_invalid_book_access(self):
        """Test accessing non-existent book"""
        print("\n🚫 Testing Invalid Book Access...")
        
        fake_book_id = "00000000-0000-0000-0000-000000000000"
        response = self.make_request("GET", f"/books/{fake_book_id}")
        
        if response and response.status_code == 404:
            self.log_test("Invalid Book Access", True, "Correctly returned 404 for non-existent book")
            return True
        else:
            self.log_test("Invalid Book Access", False, f"Expected 404, got: {response.status_code if response else 'No response'}")
            return False
    
    def test_book_status_nonexistent(self):
        """Test book status for non-existent book"""
        print("\n📊 Testing Book Status (Non-existent)...")
        
        fake_book_id = "00000000-0000-0000-0000-000000000000"
        response = self.make_request("GET", f"/books/{fake_book_id}/status")
        
        if response and response.status_code == 404:
            self.log_test("Book Status (Non-existent)", True, "Correctly returned 404 for non-existent book")
            return True
        else:
            self.log_test("Book Status (Non-existent)", False, f"Expected 404, got: {response.status_code if response else 'No response'}")
            return False
    
    def test_invalid_token(self):
        """Test with invalid JWT token"""
        print("\n🔒 Testing Invalid Token...")
        
        # Save current token
        original_token = self.access_token
        
        # Use invalid token
        self.access_token = "invalid.token.here"
        
        response = self.make_request("GET", "/books/")
        
        # Restore original token
        self.access_token = original_token
        
        if response and response.status_code == 401:
            self.log_test("Invalid Token", True, "Correctly rejected invalid token")
            return True
        else:
            self.log_test("Invalid Token", False, f"Expected 401, got: {response.status_code if response else 'No response'}")
            return False
    
    def test_token_refresh(self):
        """Test token refresh functionality"""
        print("\n🔄 Testing Token Refresh...")
        
        # First get a refresh token by logging in again
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        
        response = self.make_request("POST", "/auth/login", data=login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            refresh_token = data.get("refresh_token")
            
            if refresh_token:
                # Test refresh
                refresh_data = {"refresh_token": refresh_token}
                refresh_response = self.make_request("POST", "/auth/refresh", data=refresh_data)
                
                if refresh_response and refresh_response.status_code == 200:
                    refresh_data = refresh_response.json()
                    if refresh_data.get("success") and refresh_data.get("access_token"):
                        self.log_test("Token Refresh", True, "Token refreshed successfully")
                        return True
                    else:
                        self.log_test("Token Refresh", False, "Invalid refresh response format")
                        return False
                else:
                    self.log_test("Token Refresh", False, f"Refresh failed: {refresh_response.status_code if refresh_response else 'No response'}")
                    return False
            else:
                self.log_test("Token Refresh", False, "No refresh token in login response")
                return False
        else:
            self.log_test("Token Refresh", False, "Login failed for refresh test")
            return False
    
    def run_all_tests(self):
        """Run all test cases"""
        print("🚀 Starting DuoRead API Test Suite")
        print("=" * 50)
        
        # Basic connectivity
        if not self.test_health_check():
            print("❌ Health check failed. Make sure the server is running.")
            return
        
        # Authentication flow
        self.test_signup()
        self.test_login()
        
        # Security tests
        self.test_protected_endpoint_without_auth()
        self.test_invalid_token()
        
        # User management
        self.test_get_user_profile()
        
        # Book management (basic)
        self.test_list_books()
        self.test_invalid_book_access()
        self.test_book_status_nonexistent()
        
        # Chat functionality
        self.test_chat_without_book()
        self.test_get_chat_history()
        
        # Token management
        self.test_token_refresh()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n" + "=" * 50)
        
        if failed_tests == 0:
            print("🎉 All tests passed! API is working correctly.")
        else:
            print("⚠️ Some tests failed. Check the server logs for details.")

if __name__ == "__main__":
    tester = DuoReadAPITester()
    tester.run_all_tests()
