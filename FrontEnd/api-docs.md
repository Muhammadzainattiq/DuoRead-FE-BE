# 📚 **DuoRead API Documentation**

## 🔐 **Authentication**

All API endpoints (except authentication endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🔐 **Authentication Endpoints**

### **POST** `/auth/signup`
**Description:** Register a new user account

**Request Body:**
```json
{
  "name": "string (2-100 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)",
  "native_language": "string (2-50 chars)"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "string",
  "user_id": "string",
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "native_language": "string",
    "created_at": "string"
  }
}
```

---

### **POST** `/auth/login`
**Description:** Authenticate user and get access tokens

**Request Body:**
```json
{
  "email": "string (valid email)",
  "password": "string"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "string",
  "user_id": "string",
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "native_language": "string",
    "created_at": "string"
  }
}
```

---

### **POST** `/auth/refresh`
**Description:** Refresh access token using refresh token

**Request Body:**
```json
{
  "refresh_token": "string"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "string",
  "user_id": "string",
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "native_language": "string",
    "created_at": "string"
  }
}
```

---

### **POST** `/auth/verify`
**Description:** Verify if access token is valid

**Request Body:**
```json
{
  "access_token": "string"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "string",
  "valid": true,
  "user_id": "string"
}
```

---

### **GET** `/auth/user/{user_id}`
**Description:** Get user profile information

**Response Body:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "native_language": "string",
  "created_at": "string"
}
```

---

### **PUT** `/auth/profile`
**Description:** Update user profile information (name and native language)

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "name": "string (optional, 2-100 chars)",
  "native_language": "string (optional, 2-50 chars)"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "string (UUID)",
    "name": "string",
    "email": "string",
    "native_language": "string",
    "created_at": "string (ISO datetime)",
    "updated_at": "string (ISO datetime)"
  }
}
```

---

## 📖 **Book Management Endpoints**

### **POST** `/books/upload`
**Description:** Upload a PDF book and start background processing

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Query Parameters:**
- `title`: string (required, 1-200 chars) - Title of the book
- `description`: string (optional, max 1000 chars) - Description of the book
- `book_language`: string (optional, max 50 chars) - Language of the book (e.g., English, Spanish, French)
- `auto_lang_detect`: boolean (optional, default false) - Automatically detect book language from content

**Request Body:** `multipart/form-data`
- `file`: PDF file (required, max 50MB)

**Response Body:**
```json
{
  "success": true,
  "message": "string",
  "book_id": "string",
  "book": {
    "id": "string",
    "user_id": "string",
    "title": "string",
    "description": "string",
    "book_language": "string",
    "created_at": "datetime",
    "embedding_count": 0
  },
  "total_chunks": 0
}
```

**Frontend Usage Example:**
```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const params = new URLSearchParams({
  title: 'My Book Title',
  description: 'Book description (optional)',
  book_language: 'English', // optional
  auto_lang_detect: 'false' // optional
});

fetch(`/books/upload?${params}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

### **GET** `/books/`
**Description:** List all books for a user with pagination

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Query Parameters:**
- `skip`: integer (optional, default 0)
- `limit`: integer (optional, default 10)

**Response Body:**
```json
{
  "success": true,
  "message": "string",
  "books": [
    {
      "id": "string",
      "user_id": "string",
      "title": "string",
      "description": "string",
      "book_language": "string",
      "created_at": "datetime",
      "embedding_count": 0,
      "page_count": 0,
      "is_demo": false
    }
  ],
  "total_books": 0
}
```

---

### **GET** `/books/{book_id}`
**Description:** Get detailed information about a specific book

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Response Body:**
```json
{
  "success": true,
  "message": "string",
  "book": {
    "id": "string",
    "user_id": "string",
    "title": "string",
    "description": "string",
    "book_language": "string",
    "created_at": "datetime",
    "embedding_count": 0,
    "page_count": 0,
    "is_demo": false
  },
  "embeddings": [
    {
      "id": "string",
      "page_no": 0,
      "chunk_no": 0,
      "content": "string"
    }
  ]
}
```

---

### **POST** `/books/{book_id}/search`
**Description:** Search for content within a specific book using semantic similarity

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "query": "string (1-500 chars)",
  "limit": 5
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "string",
  "book_id": "string",
  "query": "string",
  "results": [
    {
      "id": "string",
      "page_no": 0,
      "chunk_no": 0,
      "content": "string",
      "similarity": 0.85
    }
  ],
  "total_results": 0
}
```

---

### **PUT** `/books/{book_id}`
**Description:** Update book metadata (title, description, language)

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "title": "string (1-200 chars)",
  "description": "string (max 1000 chars)",
  "book_language": "string (max 50 chars)"
}
```

**Response Body:**
```json
{
  "id": "string",
  "user_id": "string",
  "title": "string",
  "description": "string",
  "book_language": "string",
  "created_at": "datetime",
  "embedding_count": 0
}
```

---

### **DELETE** `/books/{book_id}`
**Description:** Delete a book and all its embeddings

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Response Body:**
```json
{
  "success": true,
  "message": "string",
  "book_id": "string",
  "deleted_embeddings": 0
}
```

---

### **GET** `/books/{book_id}/pages`
**Description:** Get list of all pages in a book

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Response Body:**
```json
{
  "success": true,
  "message": "string",
  "book_id": "string",
  "pages": [
    {
      "page_no": 1,
      "chunk_count": 3,
      "total_content_length": 1500
    }
  ],
  "total_pages": 0
}
```

---

### **GET** `/books/{book_id}/page/{page_no}`
**Description:** Get complete content of a specific page

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Response Body:**
```json
{
  "success": true,
  "message": "string",
  "book_id": "string",
  "page_no": 1,
  "content": "string",
  "content_length": 0
}
```

---

### **GET** `/books/{book_id}/status`
**Description:** Check if book processing is complete

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Response Body:**
```json
{
  "success": true,
  "message": "string",
  "book_id": "string",
  "title": "string",
  "status": "processed|processing",
  "is_processed": true,
  "embedding_count": 0,
  "ready_for_search": true
}
```

---

### **GET** `/books/{book_id}/pdf`
**Description:** Download the original PDF file for a book

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Response:** 
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="Book Title.pdf"`
- **Body:** Binary PDF file content

**Notes:**
- Returns the original PDF file that was uploaded
- Only accessible by the book owner
- File is served with the original book title as filename

---

### **POST** `/books/translate`
**Description:** Translate text from one language to another using AI

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "text": "string (1-5000 chars)",
  "current_language": "string (2-50 chars)",
  "to_language": "string (2-50 chars)"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Translation completed successfully",
  "original_text": "string",
  "translated_text": "string",
  "current_language": "string",
  "to_language": "string"
}
```

**Example Usage:**
```json
{
  "text": "Hello, how are you today?",
  "current_language": "English",
  "to_language": "Spanish"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Translation completed successfully",
  "original_text": "Hello, how are you today?",
  "translated_text": "Hola, ¿cómo estás hoy?",
  "current_language": "English",
  "to_language": "Spanish"
}
```

---

### **POST** `/books/translate-word`
**Description:** Translate a single word from one language to another using AI

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "word": "string (1-100 chars)",
  "current_language": "string (2-50 chars)",
  "to_language": "string (2-50 chars)"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Word translated successfully",
  "original_word": "string",
  "translated_word": "string",
  "current_language": "string",
  "to_language": "string"
}
```

**Example Usage:**
```json
{
  "word": "hello",
  "current_language": "English",
  "to_language": "Spanish"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Word translated successfully",
  "original_word": "hello",
  "translated_word": "hola",
  "current_language": "English",
  "to_language": "Spanish"
}
```

---

### **POST** `/books/simplify`
**Description:** Simplify text by converting it into easier-to-understand language while preserving the original meaning

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "text": "string (1-5000 chars)"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Text simplified successfully",
  "original_text": "string",
  "processed_text": "string",
  "processing_type": "simplify"
}
```

---

### **POST** `/books/explain`
**Description:** Expand and elaborate on the input text by providing additional context, background, or clarification

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "text": "string (1-5000 chars)"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Text explanation completed successfully",
  "original_text": "string",
  "processed_text": "string",
  "processing_type": "explain"
}
```

---

### **POST** `/books/summarize`
**Description:** Generate a concise summary of the input text while preserving its key information and meaning

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "text": "string (1-5000 chars)"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Text summarization completed successfully",
  "original_text": "string",
  "processed_text": "string",
  "processing_type": "summarize"
}
```

---

## 📌 **Sticky Notes Endpoints**

### **POST** `/sticky-notes/`
**Description:** Create a new sticky note for a book page

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "book_id": "string (UUID)",
  "page_number": 1,
  "selected_text": "string (1-5000 chars)",
  "tool_output": "string (1-10000 chars)",
  "tool_type": "translation|definition|simplification|explanation|summary|synonym|pronunciation|chat",
  "color": "yellow|blue|green|pink|purple|orange|red (optional, default: yellow)",
  "coordinates": {"x": 100, "y": 200} // optional
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Sticky note created successfully",
  "note": {
    "id": "string (UUID)",
    "user_id": "string (UUID)",
    "book_id": "string (UUID)",
    "page_number": 1,
    "selected_text": "string",
    "tool_output": "string",
    "tool_type": "string",
    "color": "string",
    "coordinates": {"x": 100, "y": 200},
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

---

### **GET** `/sticky-notes/book/{book_id}`
**Description:** Get all sticky notes for a specific book, optionally filtered by page number

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Query Parameters:**
- `page_number`: integer (optional) - Filter notes by specific page

**Response Body:**
```json
{
  "success": true,
  "message": "Retrieved X sticky notes",
  "notes": [
    {
      "id": "string (UUID)",
      "user_id": "string (UUID)",
      "book_id": "string (UUID)",
      "page_number": 1,
      "selected_text": "string",
      "tool_output": "string",
      "tool_type": "string",
      "color": "string",
      "coordinates": {"x": 100, "y": 200},
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ],
  "total_notes": 0
}
```

---

### **GET** `/sticky-notes/{note_id}`
**Description:** Get a specific sticky note by ID

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Response Body:**
```json
{
  "success": true,
  "message": "Sticky note retrieved successfully",
  "note": {
    "id": "string (UUID)",
    "user_id": "string (UUID)",
    "book_id": "string (UUID)",
    "page_number": 1,
    "selected_text": "string",
    "tool_output": "string",
    "tool_type": "string",
    "color": "string",
    "coordinates": {"x": 100, "y": 200},
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

---

### **PUT** `/sticky-notes/{note_id}`
**Description:** Update an existing sticky note

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:** (all fields optional)
```json
{
  "selected_text": "string (1-5000 chars)",
  "tool_output": "string (1-10000 chars)",
  "tool_type": "translation|definition|simplification|explanation|summary|synonym|pronunciation|chat",
  "color": "yellow|blue|green|pink|purple|orange|red",
  "coordinates": {"x": 100, "y": 200}
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Sticky note updated successfully",
  "note": {
    "id": "string (UUID)",
    "user_id": "string (UUID)",
    "book_id": "string (UUID)",
    "page_number": 1,
    "selected_text": "string",
    "tool_output": "string",
    "tool_type": "string",
    "color": "string",
    "coordinates": {"x": 100, "y": 200},
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

---

### **DELETE** `/sticky-notes/{note_id}`
**Description:** Delete a sticky note

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Response Body:**
```json
{
  "success": true,
  "message": "Sticky note deleted successfully",
  "note_id": "string (UUID)"
}
```

---

## 💬 **Chat Endpoints**

### **POST** `/api/chat`
**Description:** Send a message to the book agent and get AI response

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "message": "string",
  "context": "string (optional)",
  "book_id": "string (optional)"
}
```

**Response Body:**
```json
{
  "response": "string",
  "agent_type": "book"
}
```

---

### **GET** `/api/chatHistory`
**Description:** Get chat history for a user-book combination

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Query Parameters:**
- `book_id`: string (optional)

**Response Body:**
```json
{
  "history": [
    {
      "role": "user|bot",
      "content": "string"
    }
  ],
  "agent_type": "book"
}
```

---

### **DELETE** `/api/chat`
**Description:** Delete chat history for a specific user-book combination

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "book_id": "string"
}
```

**Response Body:**
```json
{
  "message": "string",
  "agent_type": "book"
}
```

---

## 🌊 **Streaming Endpoints (Server-Sent Events)**

### **POST** `/books/chat/stream`
**Description:** Stream chat responses using Server-Sent Events

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "message": "string",
  "context": "string (optional)",
  "book_id": "string (optional)"
}
```

**Response:** Server-Sent Events stream
```
data: Hello! How can I help you today?

data: I can assist you with questions about your books.

data: [DONE]
```

---

### **POST** `/books/translate/stream`
**Description:** Stream translation responses using Server-Sent Events

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "text": "string",
  "current_language": "string",
  "to_language": "string"
}
```

**Response:** Server-Sent Events stream
```
data: Bonjour

data: [DONE]
```

---

### **POST** `/books/simplify/stream`
**Description:** Stream text simplification responses using Server-Sent Events

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "text": "string"
}
```

**Response:** Server-Sent Events stream
```
data: This is a simple version of your text.

data: [DONE]
```

---

### **POST** `/books/explain/stream`
**Description:** Stream text explanation responses using Server-Sent Events

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "text": "string"
}
```

**Response:** Server-Sent Events stream
```
data: This concept means...

data: [DONE]
```

---

### **POST** `/books/summarize/stream`
**Description:** Stream text summarization responses using Server-Sent Events

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Request Body:**
```json
{
  "text": "string"
}
```

**Response:** Server-Sent Events stream
```
data: The main points are...

data: [DONE]
```

---

## 🏥 **Health Check Endpoints**

### **GET** `/`
**Description:** Basic health check endpoint

**Response Body:**
```json
"API is working"
```

---

### **GET** `/api/chat`
**Description:** Health check for chat service

**Response Body:**
```json
"API is working"
```

---

## 📝 **Notes**

- All endpoints return appropriate HTTP status codes (200, 400, 401, 404, 500)
- **Authentication required**: All endpoints (except auth endpoints) require JWT token in Authorization header
- **User isolation**: Users can only access their own books and data
- Authentication endpoints use JWT tokens
- Book uploads are processed asynchronously in the background
- Search functionality requires books to be fully processed
- All UUIDs are in standard UUID format
- File uploads are limited to 50MB for PDF files
- Pagination is available for book listing with `skip` and `limit` parameters
- **Security**: User IDs are extracted from JWT tokens, not from request parameters
