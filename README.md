# QHandle

**Smart Multi-Department Queue Management System**

QHandle is a MERN stack application designed to help colleges manage student queues efficiently across key campus departments including **Scholarship**, **Accounts**, **Examination Cell**, **Library**, and **Hostel Office**.

---

## 🏗️ Project Structure

```
QHandle/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx         # QHandle Landing Page component
│   │   ├── App.css         # Modern styling & design system
│   │   ├── index.css       # Global styles & CSS resets
│   │   └── main.jsx        # React entry point
│   ├── index.html          # HTML shell with Google Fonts
│   └── package.json
├── server/                 # Express backend
│   ├── index.js            # Express server, CORS & API routes
│   └── package.json
├── .gitignore              # Ignored files (node_modules, builds, logs)
├── README.md               # Project documentation
└── package.json            # Root configuration with unified scripts
```

---

## ⚙️ Tech Stack

- **Frontend**: React (Vite), Modern Vanilla CSS (Inter font, sleek design system)
- **Backend**: Express.js, Node.js (with `--watch` mode), CORS
- **Dev Tooling**: Concurrently (for unified parallel execution)

---

## 🚀 Getting Started

### 1. Installation

Install root, frontend, and backend dependencies with a single command:

```bash
npm run install:all
```

Or install root dependencies, then child directories separately:

```bash
# Root dependencies (concurrently)
npm install

# Frontend dependencies
cd client && npm install

# Backend dependencies
cd server && npm install
```

---

### 2. Available Scripts

From the root directory (`/Users/aryan/Documents/QHandle`), you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | **Unified Workflow**: Runs both React frontend & Express backend simultaneously using `concurrently` |
| `npm run client` | Starts only the React frontend (Vite dev server) |
| `npm run server` | Starts only the Express backend server (Node `--watch` mode) |
| `npm run install:all` | Installs node modules for both `client` and `server` folders |

---

## 📡 API Endpoints

- **`GET /api/health`**
  - **Response**: `{ "status": "ok", "app": "QHandle" }`
  - **Purpose**: Health check endpoint to verify backend operational status.
