# Implementation Plan - College Events Website (Phase 3: Flask Backend)

## Goal
Migrate the static website to a dynamic Python Flask application for better data persistence and role management.

## Tech Stack
- Frontend: HTML5, Vanilla CSS, Vanilla JS (Fetch API)
- Backend: Python Flask
- Data Storage: Local JSON file (`data.json`)

## Architecture
- `app.py`: Entry point for Flask, handles routing and REST API.
- `static/`: JS/CSS assets.
- `templates/`: HTML templates for Index, Student, and Staff roles.
- `data.json`: Stores events and registration data on the server.

## Features
- **Persistent Events**: New events added by staff are saved to the server's disk.
- **REST API**: `/api/events` (GET/POST) and `/api/register` (POST).
- **Seed Data**: Automatically populates 8 compulsory events on the first run.
- **Improved Security**: Role separation is now facilitated through backend routes, though standard auth isn't implemented (available for expansion).

## Completed Migration
1. [x] Create `app.py` with Flask routing and API endpoints.
2. [x] Refactor `student.html` and `staff.html` to use `async/await` and `fetch`.
3. [x] Optimize project structure (Templates & Static folders).
4. [x] Verify compulsory seed data integration.
