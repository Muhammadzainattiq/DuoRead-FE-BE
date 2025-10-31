# DuoRead (Frontend + Backend)

This repository contains the frontend (DuoRead-FE-Chrome) with instructions to run both the backend and frontend locally.

Below are concise, clearly separated steps for each part of the project.

## Backend (FastAPI)

Recommended order: start the backend first so the frontend can communicate with the API.

Prerequisites
- Python 3.10+ (or the version required by `pyproject.toml`)
- A working virtual environment manager (venv, pipx, or poetry/uv tool described below)

Quick setup
1. Install dependencies (project uses `uv` tool in this repo):

```powershell
uv sync
```

2. Configure environment variables:

- Copy `.env.example` to `.env` and fill the required values.

3. Run the backend (development, auto-reload):

```powershell
uv run uvicorn main:app --reload
```

4. API docs (Swagger) will be available at:

```
http://localhost:8000/docs
```

Notes
- If you change the port in the FastAPI config, update the frontend `VITE_API_BASE_URL` accordingly.
- If you prefer to use `python -m uvicorn main:app --reload` substitute the command above.

## Frontend (Vite + React / TypeScript)

This folder contains the Chrome extension-ready frontend. The following commands assume you're in the repository root (the same directory as this `README.md`).

Prerequisites
- Node.js 16+ and npm (or yarn/pnpm)

Install dependencies

```powershell
npm install
```

Environment

Create a `.env` in the project root with at least:

```env
VITE_API_BASE_URL=http://localhost:8000
```

(Use the backend host/port you run locally or a remote API URL.)

Run development server

```powershell
npm run dev
```

The Vite dev server normally opens at:

```
http://localhost:5173
```

Note: older instructions referenced `http://localhost:8080`; Vite's default port may vary. Check the terminal output when you run `npm run dev`.

Build for production

```powershell
npm run build
```

Preview production build

```powershell
npm run preview
```

## Common troubleshooting

- If the frontend can't reach the backend, confirm `VITE_API_BASE_URL` matches the backend URL and port.
- If dependencies fail to install, delete `node_modules` and try `npm ci` (if lockfile present) or `npm install` again.
- On Windows PowerShell, if scripts fail due to execution policy, either run PowerShell as Administrator and adjust the ExecutionPolicy or use the npm scripts directly via `npx`.

## Helpful links

- Backend API docs: `http://localhost:8000/docs` (when backend is running)
- Frontend dev server: check terminal after `npm run dev` for the exact URL (commonly `http://localhost:5173`)

## Summary of changes in this file

- Split Backend and Frontend sections for clarity.
- Added prerequisites, exact commands for PowerShell, and troubleshooting tips.

If you'd like, I can also:
- Add a short `CONTRIBUTING.md` with branch and PR guidelines
- Add a script to start both backend and frontend concurrently (e.g., using `concurrently` or `npm-run-all`)

