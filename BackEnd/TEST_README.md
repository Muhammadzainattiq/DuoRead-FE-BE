# 🧪 DuoRead API Test Suite

This directory contains comprehensive test suites for the DuoRead API to verify authentication, basic functionality, and security.

## 📋 Test Files

### 1. `test_api.py` - Interactive Test Suite
- **Purpose**: Comprehensive interactive testing with detailed output
- **Features**: 
  - Step-by-step test execution
  - Detailed logging and results
  - User-friendly output with emojis
  - Test summary with pass/fail counts

### 2. `test_pytest.py` - Pytest Test Suite
- **Purpose**: Automated testing using pytest framework
- **Features**:
  - Structured test cases
  - Fixtures for authentication
  - Assertion-based testing
  - CI/CD friendly

## 🚀 Running the Tests

### Prerequisites
1. **Start your DuoRead server**:
   ```bash
   # Make sure your FastAPI server is running
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Install required packages** (if not already installed):
   ```bash
   pip install requests pytest
   ```

### Option 1: Interactive Test Suite
```bash
python test_api.py
```

**What it tests:**
- ✅ Health check endpoint
- ✅ User signup and login
- ✅ Authentication protection
- ✅ User profile retrieval
- ✅ Book listing (empty initially)
- ✅ Chat functionality
- ✅ Chat history
- ✅ Invalid book access (404 responses)
- ✅ Token refresh
- ✅ Invalid token handling

### Option 2: Pytest Test Suite
```bash
# Run all tests
pytest test_pytest.py -v

# Run specific test
pytest test_pytest.py::TestDuoReadAPI::test_health_check -v

# Run with detailed output
pytest test_pytest.py -v -s
```

## 📊 Test Coverage

### Authentication & Security
- [x] User signup
- [x] User login
- [x] JWT token validation
- [x] Protected endpoint access
- [x] Invalid token handling
- [x] Token refresh
- [x] Token verification

### User Management
- [x] Get user profile
- [x] User data validation

### Book Management (Basic)
- [x] List books (empty state)
- [x] Access non-existent book (404)
- [x] Book status for non-existent book

### Chat Functionality
- [x] Chat without book context
- [x] Chat with book context
- [x] Get chat history
- [x] Delete chat history

### Error Handling
- [x] 401 Unauthorized responses
- [x] 404 Not Found responses
- [x] Invalid request handling

## 🎯 Expected Results

### Successful Test Run
```
🚀 Starting DuoRead API Test Suite
==================================================
✅ PASS Health Check: API is responding
✅ PASS User Signup: User created: Test User
✅ PASS User Login: Logged in: Test User
✅ PASS Auth Protection: Protected endpoint correctly requires authentication
✅ PASS List Books: Found 0 books
✅ PASS Get User Profile: Profile retrieved: Test User
✅ PASS Chat (No Book): Chat response received
✅ PASS Get Chat History: Found 2 messages in history
✅ PASS Invalid Book Access: Correctly returned 404 for non-existent book
✅ PASS Book Status (Non-existent): Correctly returned 404 for non-existent book
✅ PASS Invalid Token: Correctly rejected invalid token
✅ PASS Token Refresh: Token refreshed successfully

==================================================
📊 TEST SUMMARY
==================================================
Total Tests: 12
✅ Passed: 12
❌ Failed: 0
Success Rate: 100.0%

==================================================
🎉 All tests passed! API is working correctly.
```

## 🔧 Troubleshooting

### Common Issues

1. **Connection Refused**
   ```
   ❌ FAIL Health Check: No response
   ```
   **Solution**: Make sure your DuoRead server is running on `http://localhost:8000`

2. **Authentication Errors**
   ```
   ❌ FAIL User Signup: Status: 400
   ```
   **Solution**: Check if the test user already exists. The test will try login if signup fails.

3. **Database Connection Issues**
   ```
   ❌ FAIL List Books: Status: 500
   ```
   **Solution**: Ensure PostgreSQL database is running and properly configured.

### Test Configuration

You can modify the test configuration in the test files:

```python
# In test_api.py or test_pytest.py
BASE_URL = "http://localhost:8000"  # Change if your server runs on different port
TEST_EMAIL = "test@duoread.com"     # Change test email
TEST_PASSWORD = "testpassword123"   # Change test password
```

## 📝 Notes

- Tests are designed to be **non-destructive** - they don't modify existing data
- Tests use **dedicated test accounts** to avoid conflicts
- **No complex scenarios** are tested (as requested) - only basic functionality
- Tests verify **authentication and authorization** are working correctly
- All tests are **independent** and can be run in any order

## 🎉 Success Criteria

A successful test run indicates:
- ✅ Authentication system is working
- ✅ JWT tokens are properly validated
- ✅ User isolation is enforced
- ✅ Basic API endpoints are functional
- ✅ Error handling is working correctly
- ✅ Security measures are in place

Run these tests after implementing authentication to ensure everything is working perfectly! 🚀
