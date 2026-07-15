# CRM Connect — Backend API

A production-ready **RESTful CRM backend** built with **Node.js**, **Express**, **TypeScript**, and **Prisma** (PostgreSQL). Designed to manage customers, tasks, notes, and user authentication for a CRM application.

---

## Features

- 🔐 **JWT Authentication** — Access token + refresh token flow
- 👤 **User Management** — Register, login, profile update, change password
- 📇 **Customer Management** — Full CRUD with status tracking
- ✅ **Task Management** — Create, update status/details, delete tasks
- 📝 **Notes** — Attach notes to customers
- 📧 **Forgot Password** — OTP-based password reset via email
- 🔔 **Push Notifications** — Expo push notification on task creation
- 🐳 **Docker Ready** — Multi-stage Dockerfile + docker-compose
- 🛡️ **Input Validation** — Request validation middleware on auth routes
- ⚙️ **Graceful Shutdown** — Handles SIGTERM/SIGINT properly

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ |
| Framework | Express 5 |
| Language | TypeScript 6 |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 |
| Auth | JSON Web Tokens (JWT) |
| Password Hashing | bcrypt |
| Email | Nodemailer (Gmail SMTP) |
| Push Notifications | Expo Server SDK |
| Containerization | Docker + Docker Compose |
| Testing | Jest + Supertest |

---

## Folder Structure

```
.
├── src/
│   ├── __tests__/          # Integration tests
│   ├── constants/          # HTTP status codes & error messages
│   ├── controllers/        # Request handlers (business logic)
│   ├── middlewares/        # Auth guard, error handler
│   ├── prisma/             # Prisma client singleton
│   ├── routes/             # Express routers
│   ├── types/              # TypeScript type extensions
│   ├── utils/              # Response helpers
│   ├── validators/         # Request validation middleware
│   ├── app.ts              # Express app setup
│   └── index.ts            # Server entry point
├── prisma/
│   └── schema.prisma       # Database schema
├── docs/
│   └── api.md              # Full API reference
├── .env.example            # Environment variable template
├── Dockerfile              # Multi-stage production build
├── docker-compose.yml      # PostgreSQL + App services
├── package.json
└── tsconfig.json
```

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [PostgreSQL](https://www.postgresql.org/) >= 14  *(or use Docker)*

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/crm-connect-backend.git
cd crm-connect-backend

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your values

# 4. Generate Prisma client & run migrations
npm run db:generate
npm run db:migrate

# 5. Start the development server
npm run dev
```

---

## Environment Variables

Create a `.env` file from `.env.example`:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/crm_connect` |
| `JWT_SECRET` | Secret key for signing JWTs | `my_super_secret` |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `MAIL_USER` | Gmail address for OTP emails | `you@gmail.com` |
| `MAIL_PASS` | Gmail App Password | `abcd efgh ijkl mnop` |
| `MAIL_FROM` | Email sender display name | `"CRM Connect <you@gmail.com>"` |

> ⚠️ For Gmail, use an **App Password** (not your account password). [Learn how](https://support.google.com/accounts/answer/185833).

---

## Running Locally

```bash
# Development (hot-reload)
npm run dev

# Type-check without compiling
npm run lint

# Build for production
npm run build

# Start production build
npm start
```

---

## Running with Docker

```bash
# Start PostgreSQL + App (builds image automatically)
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop all services
docker-compose down
```

The API will be available at `http://localhost:3000`.

> **Note:** On first run, you still need to apply database migrations:
> ```bash
> docker-compose exec app npx prisma migrate deploy
> ```

---

## Running Tests

```bash
npm test
```

Tests use `supertest` to make real HTTP requests against the Express app without a live database connection.

---

## API Endpoints

See [docs/api.md](docs/api.md) for the full API reference.

### Quick Overview

| Group | Base Path | Auth Required |
|-------|-----------|:---:|
| Auth | `/api/auth` | ❌ |
| Customers | `/api/customers` | ✅ |
| Tasks | `/api/tasks` | ✅ |
| Profile | `/api/profile` | ✅ |
| Notes | `/api/notes` | ✅ |

---

## Authentication Flow

```
1. POST /api/auth/register  →  Create account
2. POST /api/auth/login     →  Receive { token, refreshToken }
3. All protected requests   →  Header: Authorization: Bearer <token>
4. Token expires (15m)      →  POST /api/auth/refresh with refreshToken
5. Refresh expires (7d)     →  Re-login required
```

**Forgot Password Flow:**
```
1. POST /api/auth/forgot-password  →  OTP sent to email (valid 15 min)
2. POST /api/auth/reset-password   →  Submit email + OTP + new password
```

---

## Database Schema

```
User          — id, full_name, email, password_hash, role, avatar, expoPushToken
Customer      — id, name, phone, email, company, address, status
Task          — id, title, description, deadline, status, customer_id (FK)
Note          — id, content, customer_id (FK)
```

Relations: `Customer` has many `Task` and `Note` (cascade delete).

---

## Future Improvements

- [ ] Add pagination to `GET /customers` and `GET /tasks`
- [ ] Role-based access control (Admin vs Employee)
- [ ] Centralize request validation with [Zod](https://zod.dev/)
- [ ] Add rate limiting (`express-rate-limit`) to auth routes
- [ ] Implement refresh token rotation for better security
- [ ] Add structured logging with [Winston](https://github.com/winstonjs/winston)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Write unit tests for controllers with mocked Prisma
- [ ] Add Swagger/OpenAPI auto-generated documentation

---

## License

[MIT](LICENSE)
