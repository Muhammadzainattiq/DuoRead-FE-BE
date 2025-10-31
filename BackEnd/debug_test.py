#!/usr/bin/env python3
"""
Simple debug test to check API connectivity
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_simple():
    print("🔍 Testing basic connectivity...")
    
    # Test 1: Health check
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Health Check: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Health Check Error: {e}")
    
    # Test 2: Protected endpoint without auth
    try:
        response = requests.get(f"{BASE_URL}/books/")
        print(f"Books without auth: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Books without auth Error: {e}")
    
    # Test 3: Signup
    try:
        signup_data = {
            "name": "Debug Test User",
            "email": "debug@duoread.com",
            "password": "testpassword123",
            "native_language": "English"
        }
        response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
        print(f"Signup: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Signup Success: {data.get('success')}")
            token = data.get('access_token')
            if token:
                print(f"Token received: {token[:20]}...")
                
                # Test 4: Protected endpoint with auth
                headers = {"Authorization": f"Bearer {token}"}
                response = requests.get(f"{BASE_URL}/books/", headers=headers)
                print(f"Books with auth: {response.status_code}")
                if response.status_code == 200:
                    data = response.json()
                    print(f"Books response: {data.get('success')} - {len(data.get('books', []))} books")
                
    except Exception as e:
        print(f"Signup/Auth Error: {e}")

if __name__ == "__main__":
    test_simple()
