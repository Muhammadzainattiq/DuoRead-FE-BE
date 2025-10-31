#!/usr/bin/env python3
"""
Final comprehensive test for DuoRead API
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_api():
    print("🚀 DuoRead API Final Test")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n🏥 Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Health Check: PASS")
        else:
            print(f"❌ Health Check: FAIL - {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Health Check: ERROR - {e}")
        return
    
    # Test 2: Protected endpoint without auth
    print("\n🛡️ Testing Authentication Protection...")
    try:
        response = requests.get(f"{BASE_URL}/books/")
        if response.status_code in [401, 403]:  # Accept both 401 and 403
            print("✅ Auth Protection: PASS - Protected endpoint requires authentication")
        else:
            print(f"❌ Auth Protection: FAIL - Expected 401/403, got {response.status_code}")
    except Exception as e:
        print(f"❌ Auth Protection: ERROR - {e}")
    
    # Test 3: User Signup
    print("\n👤 Testing User Signup...")
    import random
    test_email = f"test{random.randint(1000, 9999)}@duoread.com"
    signup_data = {
        "name": "Test User",
        "email": test_email,
        "password": "testpassword123",
        "native_language": "English"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("access_token"):
                print("✅ User Signup: PASS")
                token = data["access_token"]
                user_id = data["user_id"]
            else:
                print("❌ User Signup: FAIL - Invalid response format")
                return
        else:
            print(f"❌ User Signup: FAIL - {response.status_code}")
            return
    except Exception as e:
        print(f"❌ User Signup: ERROR - {e}")
        return
    
    # Test 4: Protected endpoint with valid auth
    print("\n🔐 Testing Authenticated Access...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/books/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ Authenticated Access: PASS")
            else:
                print("❌ Authenticated Access: FAIL - Invalid response format")
        else:
            print(f"❌ Authenticated Access: FAIL - {response.status_code}")
    except Exception as e:
        print(f"❌ Authenticated Access: ERROR - {e}")
    
    # Test 5: User Profile
    print("\n👤 Testing User Profile...")
    try:
        response = requests.get(f"{BASE_URL}/auth/user/{user_id}", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("name") == "Test User":
                print("✅ User Profile: PASS")
            else:
                print("❌ User Profile: FAIL - Profile data mismatch")
        else:
            print(f"❌ User Profile: FAIL - {response.status_code}")
    except Exception as e:
        print(f"❌ User Profile: ERROR - {e}")
    
    # Test 6: Chat functionality
    print("\n💬 Testing Chat...")
    try:
        chat_data = {
            "message": "Hello, this is a test message",
            "context": "Testing chat functionality"
        }
        response = requests.post(f"{BASE_URL}/api/chat", json=chat_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("response") and data.get("agent_type") == "book":
                print("✅ Chat: PASS")
            else:
                print("❌ Chat: FAIL - Invalid response format")
        else:
            print(f"❌ Chat: FAIL - {response.status_code}")
    except Exception as e:
        print(f"❌ Chat: ERROR - {e}")
    
    # Test 7: Chat History
    print("\n📜 Testing Chat History...")
    try:
        response = requests.get(f"{BASE_URL}/api/chatHistory", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "history" in data and data.get("agent_type") == "book":
                print("✅ Chat History: PASS")
            else:
                print("❌ Chat History: FAIL - Invalid response format")
        else:
            print(f"❌ Chat History: FAIL - {response.status_code}")
    except Exception as e:
        print(f"❌ Chat History: ERROR - {e}")
    
    # Test 8: Invalid book access
    print("\n🚫 Testing Invalid Book Access...")
    try:
        fake_book_id = "00000000-0000-0000-0000-000000000000"
        response = requests.get(f"{BASE_URL}/books/{fake_book_id}", headers=headers)
        if response.status_code == 404:
            print("✅ Invalid Book Access: PASS - Correctly returned 404")
        else:
            print(f"❌ Invalid Book Access: FAIL - Expected 404, got {response.status_code}")
    except Exception as e:
        print(f"❌ Invalid Book Access: ERROR - {e}")
    
    # Test 9: Invalid token
    print("\n🔒 Testing Invalid Token...")
    try:
        invalid_headers = {"Authorization": "Bearer invalid.token.here"}
        response = requests.get(f"{BASE_URL}/books/", headers=invalid_headers)
        if response.status_code == 401:
            print("✅ Invalid Token: PASS - Correctly rejected invalid token")
        else:
            print(f"❌ Invalid Token: FAIL - Expected 401, got {response.status_code}")
    except Exception as e:
        print(f"❌ Invalid Token: ERROR - {e}")
    
    # Test 10: Login
    print("\n🔐 Testing User Login...")
    try:
        login_data = {
            "email": test_email,
            "password": "testpassword123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("access_token"):
                print("✅ User Login: PASS")
            else:
                print("❌ User Login: FAIL - Invalid response format")
        else:
            print(f"❌ User Login: FAIL - {response.status_code}")
    except Exception as e:
        print(f"❌ User Login: ERROR - {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Test completed! Check results above.")
    print("=" * 50)

if __name__ == "__main__":
    test_api()
