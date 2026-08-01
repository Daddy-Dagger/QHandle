# QHandle

**Smart Multi-Department Queue Management System**

QHandle is a MERN stack application designed to help colleges manage student queues across multiple departments such as Scholarship, Accounts, Examination Cell, Library, and Hostel Office.

## Project Structure

```
QHandle/
├── client/          # React + Vite frontend
├── server/          # Express backend
├── package.json     # Root package.json with scripts
├── .gitignore
└── README.md
```

## Getting Started

### 1. Install Dependencies

Install dependencies for both frontend and backend:

```bash
npm run install:all
```

Or install separately:

```bash
# Frontend
cd client && npm install

# Backend
cd server && npm install
```

### 2. Running the Application

- **Run Both Frontend & Backend (Unified Workflow):**
  ```bash
  npm run dev
  ```
  Runs both the React frontend (Vite) and Express backend concurrently.

- **Run Frontend Only:**
  ```bash
  npm run client
  ```

- **Run Backend Only:**
  ```bash
  npm run server
  ```

### API Endpoints

- `GET /api/health` - Health check endpoint returning `{ status: 'ok', app: 'QHandle' }`.
