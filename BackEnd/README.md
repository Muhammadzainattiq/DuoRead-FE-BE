# DuoRead Backend

## Setup

1. **Install dependencies using uv:**
   ```bash
   uv sync
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in the required values in `.env`

3. **Run the application:**
   ```bash
   uv run uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000/docs`
