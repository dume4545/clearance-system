# 🎓 University Online Clearance System

A full-stack web application for managing graduating students' clearance process.

**Stack:** PHP 8+ · MySQL 8+ · React 18 · Tailwind CSS 3 · Vite

---

## System Overview

| Role    | Capabilities |
|---------|-------------|
| **Student** | Register, submit clearance requests to each department, track real-time status, re-submit after rejection |
| **Staff**   | View all clearance requests for their assigned department, approve or reject with remarks |
| **Admin**   | Full oversight — manage users, view per-department statistics, audit activity logs |

### Clearance Offices (pre-seeded)
- HOD / Faculty
- Bursary / Finance
- Library
- Health Centre (BUTH)
- Hostel Administration
- Academic Registry

---

## Project Structure

```
clearance-system/
├── backend/                   # PHP REST API
│   ├── config/
│   │   ├── db.php             # DB connection & constants
│   │   └── cors.php           # CORS headers + helpers
│   ├── middleware/
│   │   └── auth.php           # Bearer token validation
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.php
│   │   │   ├── register.php
│   │   │   ├── logout.php
│   │   │   └── departments.php
│   │   ├── student/
│   │   │   ├── dashboard.php
│   │   │   └── request_clearance.php
│   │   ├── staff/
│   │   │   ├── dashboard.php
│   │   │   └── action.php
│   │   └── admin/
│   │       ├── dashboard.php
│   │       ├── users.php
│   │       └── clearances.php
│   ├── database.sql
│   └── .htaccess
│
└── frontend/                  # React + Vite
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── StudentDashboard.jsx
    │   │   ├── StaffDashboard.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── StatusBadge.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Installation & Setup

### Prerequisites
- PHP 8.1+
- MySQL 8+
- Node.js 18+
- Apache (XAMPP / LAMP) or any PHP server

---

### 1. Database Setup

1. Open **phpMyAdmin** or MySQL CLI.
2. Run the schema file:

```sql
SOURCE /path/to/clearance-system/backend/database.sql;
```

This creates the `clearance_db` database, all tables, pre-seeds 6 departments, and creates a default admin account.

**Default Admin Credentials:**
```
Email:    admin@university.edu
Password: Admin@1234
```

> ⚠️ Change the admin password after first login (via MySQL).

---

### 2. Backend Setup

1. Place the `backend/` folder inside your web server's root (e.g. `htdocs/clearance-system/`).

2. Edit `backend/config/db.php` and update:

```php
define('DB_USER', 'your_mysql_user');
define('DB_PASS', 'your_mysql_password');
define('JWT_SECRET', 'a_long_random_secret_key');
```

3. If your frontend runs on a different origin, set the env var or update `cors.php`:

```php
$allowed = 'http://localhost:5173';  // your React dev URL
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```
VITE_API_BASE=http://localhost/clearance-system/backend
```

> Adjust the URL to match where your PHP backend is served.

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```
The `dist/` folder can be served by Apache or any static host.

---

## API Endpoints Reference

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register.php` | Register student or staff |
| POST | `/api/auth/login.php` | Login → returns `token` + `user` |
| POST | `/api/auth/logout.php` | Invalidate token (Auth required) |
| GET  | `/api/auth/departments.php` | List all departments |

### Student (Auth required · role: student)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/student/dashboard.php` | Clearance status per department |
| POST | `/api/student/request_clearance.php` | Submit / re-submit clearance request |

### Staff (Auth required · role: staff)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/staff/dashboard.php?status=pending\|approved\|rejected\|all` | List requests for the staff's department |
| PUT | `/api/staff/action.php` | Approve or reject a request |

### Admin (Auth required · role: admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/admin/dashboard.php` | System stats + per-department breakdown + activity |
| GET    | `/api/admin/users.php?role=student\|staff\|all&search=` | List users |
| PUT    | `/api/admin/users.php` | Toggle active / change role |
| DELETE | `/api/admin/users.php?user_id=N` | Delete user |
| GET    | `/api/admin/clearances.php?status=&dept_id=&search=` | All clearance records |

---

## Authentication Flow

```
Client                              Server
  │                                    │
  ├──── POST /api/auth/login.php ──────►│
  │         { email, password }         │
  │◄─── { token, user } ───────────────┤
  │                                    │
  ├──── GET  /api/student/dashboard ───►│
  │    Authorization: Bearer <token>    │ validates token in auth_tokens table
  │◄─── { departments, summary } ──────┤
```

Tokens are stored in `auth_tokens` table with a 24-hour expiry. Expired tokens are cleaned up on each login.

---

## Clearance Workflow

```
Student registers
       │
       ▼
Student requests clearance → creates clearance_request (status=pending)
       │
       ▼
Staff reviews request → updates status to approved / rejected + remarks
       │
       ▼
Student sees real-time status per department
       │
       ▼
All 6 departments approved → Student is fully cleared 🎓
```

---

## Security Notes

- Passwords hashed with `bcrypt` (cost=12)
- All DB queries use PDO prepared statements (no SQL injection)
- CORS restricted to frontend origin
- Role-based access enforced on every protected endpoint
- Activity audit log maintained for all key actions

---

## Production Checklist

- [ ] Update `DB_USER`, `DB_PASS`, `JWT_SECRET` in `config/db.php`
- [ ] Set `FRONTEND_ORIGIN` env var or update `cors.php` for your domain
- [ ] Enable HTTPS on your server
- [ ] Set `APP_ENV=production` and disable PHP error display
- [ ] Run `npm run build` and serve `dist/` as the frontend
- [ ] Change default admin password
- [ ] Set up automated database backups
