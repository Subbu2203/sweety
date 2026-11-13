# Sweety – Blood Glucose Tracker

A full-stack web application to track and monitor blood glucose readings.

## Features

- User Registration and Login
- JWT-based Authentication
- Add, View, Edit and Delete Glucose Readings
- Reading Validation (40–600 mg/dL)
- Daily and Monthly Reports
- Glucose Trend Chart
- Dark Mode
- Responsive Design
- PostgreSQL Database

## Tech Stack

**Frontend**
- React.js
- Vite
- Recharts
- CSS

**Backend**
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt

## Project Structure

```text
sweety/
├── backend/
│   ├── middleware/
│   ├── routes/
│   ├── db.js
│   └── server.js
├── client/
│   └── src/
├── README.md
└── .gitignore
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Subbu2203/sweety.git
cd sweety
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder and configure your database credentials and JWT secret.

### 3. Database Setup

Create a PostgreSQL database named:

```sql
CREATE DATABASE sweety_db;
```

Run the SQL commands from `backend/schema.sql` to create the required tables.

### 4. Start Backend

```bash
node server.js
```

Backend runs at `http://localhost:5000`.

### 5. Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## API Features

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get logged-in user |
| GET | /api/readings | Get readings |
| POST | /api/readings | Add reading |
| PUT | /api/readings/:id | Update reading |
| DELETE | /api/readings/:id | Delete reading |
| GET | /api/readings/reports | Get reports |

## Security

- Password hashing using bcrypt
- JWT-based protected routes
- User-specific reading access
- Input validation

## Author

Developed as a full-stack web development project.
