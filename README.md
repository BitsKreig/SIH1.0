# Project Setup and Running Instructions

This project consists of a backend and a frontend:

## Backend
- Technology: Python Flask with a C++ executable for timetable generation.
- Runs on port 5001.

### Setup
1. Navigate to the `Backend` directory.
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   (If `requirements.txt` is not present, install Flask and flask_cors manually)
4. Ensure the C++ executable `timetable_generator` is present and executable in the `Backend-1` directory.
5. Run the backend server:
   ```bash
   python TimeTable.Backend.py
   ```

## Frontend
- Technology: React with Vite.
- Runs on port 5173.

### Setup
1. Navigate to the `Frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   ```

## Notes
- The frontend expects the backend API to be available at `http://localhost:5001`.
- Make sure both backend and frontend servers are running simultaneously.
- The C++ executable is a critical part of the backend and must be compiled and present.
- If you encounter CORS issues, verify backend CORS settings.

## Running the Project
1. Start the backend server first.
2. Start the frontend server.
3. Open the frontend URL (usually `http://localhost:5173`) in a browser.
4. Use the UI to generate and view timetables.

## Troubleshooting
- If the backend fails to start, check Python environment and dependencies.
- If the frontend fails to connect to backend, check API URLs and ports.
- Ensure the C++ executable has execute permissions (`chmod +x timetable_generator`).

## Additional
- To build the frontend for production, run `npm run build` in `Frontend-1`.
- To run backend in production, consider using a production WSGI server.
