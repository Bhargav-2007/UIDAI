# Aadhaar Enrolment & Update Insight Platform

## Project Overview
This project is an execution-driven analytics platform designed for UIDAI. It provides audit-grade insights into Aadhaar enrolment and update data, featuring interactive dashboards, fraud detection, and predictive analytics.

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **Data Analysis**: Pandas, NumPy, SciPy, Scikit-learn
- **Server**: Uvicorn

### Frontend
- **Framework**: React (Vite)
- **Language**: JavaScript/JSX
- **Visualization**: Recharts
- **Styling**: TailwindCSS (via index.css/App.css conventions)

---

## Setup Instructions

### 1. Prerequisites
Ensure you have the following installed:
- Python (3.10 or higher)
- Node.js (v18 or higher)
- Git

### 2. Backend Setup
The backend handles data processing and serves the API.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  (Optional but recommended) Create and activate a virtual environment:
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate

    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

### 3. Frontend Setup
The frontend provides the user interface.

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install Node.js dependencies:
    ```bash
    npm install
    ```

---

## How to Run

### Running the Backend
1.  From the `backend` directory, run:
    ```bash
    python main.py
    ```
    *Alternatively, you can run directly with uvicorn:*
    ```bash
    uvicorn main:app --reload
    ```

2.  The API will be available at: `http://localhost:8000`
3.  Interactive API Docs (Swagger): `http://localhost:8000/docs`

### Running the Frontend
1.  From the `frontend` directory, run:
    ```bash
    npm run dev
    ```

2.  The application will be accessible at: `http://localhost:5173`

---

## Troubleshooting

-   **Backend Port Conflict**: If port 8000 is busy, modify the port in `backend/main.py`.
-   **Frontend Port**: Vite usually defaults to 5173, but will check for the next available port if it's taken. Check the terminal output for the correct URL.
-   **Data Loading**: The backend attempts to load CSV data on startup. Ensure `Dataset/` folder exists in the root if applicable (based on `data_loader.py` logic).
