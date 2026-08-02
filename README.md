# QHandle

**Smart Multi-Department Campus Queue Management System**

QHandle is a modern MERN stack queue management platform designed for educational institutions to eliminate physical waiting lines and streamline student administrative services across key campus departments.

---

## 🌟 Key Features

- 🎓 **Student Portal**
  - **Instant Ticket Issuance**: Issue verified digital queue passes (e.g., `SCH-001`, `ACC-002`).
  - **Live Progress & Estimated Wait**: Real-time position updates and estimated wait time calculations.
  - **Leave Queue Feature**: Students can voluntarily cancel their token and leave the queue, automatically adjusting live position counters.
  - **Pass Actions**: Print digital pass, copy token number, and refresh queue status.

- 💻 **Staff & Faculty Control Center**
  - **Counter Terminals**: Manage individual service counters (Counter A, Counter B, Counter C).
  - **Call Next & Complete**: One-click actions to call the next waiting token to a counter or mark serving tokens complete.
  - **Waiting Queue Ledger**: View and search active waiting tokens grouped by service counter.

- 📺 **Lobby TV Display Screen**
  - **Public Monitor**: Live display showing currently served tokens per counter, upcoming waiting lists, live clock ticker, and announcement marquee.

- 🛡️ **Con-Currency & Reliability**
  - **Atomic Sequence Engine**: Uses MongoDB atomic `$inc` updates and database constraints to guarantee zero duplicate tokens even under heavy concurrent load.
  - **Daily Token Reset**: Automatically resets sequence numbers to `001` every day per department.
  - **Index Synchronization**: Auto-syncs database indexes on server startup.

- 🌐 **Multi-Language Support**
  - Built-in localization for **English**, **Hindi (हिंदी)**, and **Punjabi (ਪੰਜਾਬੀ)**.

---

## 🏛️ Supported Campus Departments

1. **Scholarship Office** (`SCH`) — Financial aid, fee concessions & scholarship processing.
2. **Accounts Office** (`ACC`) — Fee payments, tuition receipts, dues & financial clearances.
3. **Examination Cell** (`EXM`) — Hall tickets, grade sheets, transcripts & re-evaluations.
4. **Library** (`LIB`) — Book issuance/returns, membership cards & research access.
5. **Hostel Office** (`HST`) — Room allocations, hostel fees & maintenance requests.
6. **IT & Tech Support** (`ITS`) — Wi-Fi credentials, portal logins, LMS access & laptop support.

---

## ⚙️ Tech Stack

- **Frontend**: React, Vite, Lucide React icons, Canvas Confetti, Vanilla CSS (Glassmorphism & dark mode design system).
- **Backend**: Node.js, Express.js, MongoDB, Mongoose ODM.
- **Dev Tooling**: Concurrently (unified client and server execution).

---

## 🏗️ Project Structure

```
QHandle/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # UI Components
│   │   │   ├── BackgroundCanvas.jsx
│   │   │   ├── LanguageSelector.jsx
│   │   │   ├── StaffDashboard.jsx
│   │   │   ├── StaffLoginPage.jsx
│   │   │   ├── StudentLoginPage.jsx
│   │   │   ├── TokenCard.jsx
│   │   │   └── TVDisplay.jsx
│   │   ├── context/            # Language & state context
│   │   │   └── LanguageContext.jsx
│   │   ├── utils/              # Audio & translation helpers
│   │   │   ├── audio.js
│   │   │   └── translations.js
│   │   ├── App.jsx             # Main Application shell
│   │   ├── App.css             # Glassmorphism styling & tokens
│   │   └── main.jsx
│   └── package.json
├── server/                     # Express + MongoDB Backend
│   ├── config/                 # DB connection & seed scripts
│   │   ├── db.js
│   │   └── seed.js
│   ├── models/                 # Mongoose Schemas
│   │   ├── Counter.js
│   │   ├── Department.js
│   │   └── QueueToken.js
│   ├── routes/                 # API Endpoints
│   │   └── api.js
│   ├── index.js                # Server entry point
│   ├── .env                    # Environment variables
│   └── package.json
├── README.md
└── package.json                # Root package configuration
```

---

## 📡 API Endpoints

### Student Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/departments` | Fetch all active campus departments |
| `POST` | `/api/queue/join` | Join department queue & generate digital token |
| `POST` | `/api/queue/leave` | Cancel waiting token and leave queue |

### Staff & TV Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/staff/:departmentId/counters` | Fetch counters & serving tokens for a department |
| `GET` | `/api/staff/:departmentId/queue` | Fetch waiting queue tokens grouped by counter |
| `POST` | `/api/staff/:counterId/call-next` | Call next waiting token to counter |
| `POST` | `/api/staff/:counterId/complete` | Complete currently serving token |
| `POST` | `/api/departments/:id/reset-sequence` | Manually reset department daily token sequence |

### System Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend health check endpoint |

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: v18+ recommended.
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI.

### 2. Environment Setup

Configure `server/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/qhandle
PORT=5001
```

### 3. Installation

Install root, frontend, and backend dependencies with a single command from the project root:

```bash
npm run install:all
```

### 4. Running Locally

Start both client and server concurrently:

```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5001`
