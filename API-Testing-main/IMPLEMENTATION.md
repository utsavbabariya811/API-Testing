# Project Implementation Summary

## Overview
This repository contains a full-stack **RESTful Task Management API & Dashboard** built using **Node.js**, **Express**, and **MongoDB (Mongoose)**. It provides robust middleware pipelines, strict data validation, clean API routes, comprehensive error handling, and an interactive web interface.

---

## 🚀 Key Implemented Components

### 1. **Core Application Server (`server.js`)**
- Configures and runs the Express application server.
- Connects to MongoDB via **Mongoose**.
- Registers request logger, JSON content-type validator, static file server, task routes, 404 handler, and global error handling pipeline.

---

### 2. **Data Model (`src/models/Task.js`)**
Defined Mongoose schema for tasks with validation rules:
- **`title`**: String (Required, trimmed)
- **`description`**: String (Required, trimmed)
- **`status`**: String Enum (`'pending'`, `'in-progress'`, `'completed'`), defaults to `'pending'`
- **`priority`**: String Enum (`'low'`, `'medium'`, `'high'`), defaults to `'medium'`
- **`dueDate`**: Date (Optional)
- **`timestamps`**: Automatically tracks `createdAt` and `updatedAt` timestamps.

---

### 3. **API Routes & Controllers (`src/routes/taskRoutes.js`)**
Implemented complete RESTful endpoints under `/tasks`:
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/tasks` | Create a new task |
| `GET` | `/tasks` | List all tasks (supports `search`, `status`, `page`, and `limit` parameters) |
| `GET` | `/tasks/:id` | Get details of a single task by ID |
| `PUT` | `/tasks/:id` | Replace / fully update an existing task |
| `PATCH` | `/tasks/:id` | Partially update fields of an existing task |
| `DELETE` | `/tasks/:id` | Delete a task by ID |

---

### 4. **Middleware Pipeline (`src/middleware/`)**
- **`logger.js`**: Logs HTTP method, URL path, timestamp, and client IP address for all incoming requests.
- **`contentType.js`**: Enforces `Content-Type: application/json` headers on incoming write operations (`POST`, `PUT`, `PATCH`).
- **`idValidator.js`**: Validates whether target parameter `:id` is a valid 24-character hex MongoDB ObjectId.
- **`notFound.js`**: Intercepts undefined endpoints and returns structured JSON `404 Not Found` responses.
- **`errorHandler.js`**: Centralized error middleware catching Mongoose validation errors, duplicate key errors, cast errors, and server crashes.

---

### 5. **Interactive Frontend Dashboard (`public/index.html`)**
- Built an interactive web user interface.
- Allows real-time viewing, creating, updating, status toggling, searching, and deleting of tasks via AJAX/Fetch requests.

---

### 6. **Automated Testing Suite (`test-api.js`)**
- Self-contained unit & integration test runner using `mongodb-memory-server`.
- Automatically tests:
  - Task creation and data validation
  - Retrieval and search filtering
  - Updating (PUT / PATCH)
  - Deletion logic
  - 404 & Invalid ObjectId handling
  - Middleware Content-Type enforcement

---

## 🛠️ Execution & Test Commands

- **Start Production Server**: `npm start`
- **Start Development Mode**: `npm run dev`
- **Run Automated API Tests**: `npm test`
