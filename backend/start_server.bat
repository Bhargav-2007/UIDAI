@echo off
cd /d d:\DELL\Documents\UIDAI\backend
venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8000
pause
