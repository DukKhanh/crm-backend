# CRM Connect Backend API

<p align="center">
  <strong>A production-ready RESTful CRM backend built with Node.js, Express.js, TypeScript, Prisma ORM, and PostgreSQL.</strong>
</p>

<p align="center">
Designed as a portfolio project to demonstrate backend development skills, including authentication, customer management, task tracking, email-based password recovery, push notifications, Dockerized deployment, and automated testing.
</p>

<p align="center">

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/Tested_with-Jest-C21325?logo=jest)
![License](https://img.shields.io/badge/License-MIT-yellow)

</p>

---

# Project Overview

CRM Connect Backend API is a RESTful backend service for a Customer Relationship Management (CRM) system.

The project focuses on applying backend engineering best practices by implementing authentication, customer management, task management, password recovery, push notifications, Dockerized deployment, and automated integration testing.

Rather than being a simple CRUD application, it demonstrates how modern backend services are structured using Express, Prisma ORM, and PostgreSQL.

---

# Highlights

- RESTful API Architecture
- JWT Authentication & Refresh Token
- Customer, Task, Note & Profile Management
- OTP-based Password Recovery via Email
- Expo Push Notifications
- Prisma ORM + PostgreSQL
- Dockerized Development Environment
- Integration Testing using Jest & Supertest
- Centralized Error Handling
- Input Validation Middleware
- Graceful Server Shutdown

---

# System Architecture

```text
                    Client
                       │
                       ▼
               Express REST API
                       │
        Authentication Middleware
                       │
                 Controllers
                       │
                  Prisma ORM
                       │
                  PostgreSQL
```

---

# Features

## Authentication

- User Registration
- Login
- JWT Authentication
- Refresh Token Flow
- Logout
- Change Password
- Forgot Password
- OTP Email Verification
- Profile Management

---

## Customer Management

- Create Customer
- Get Customer List
- Customer Detail
- Update Customer
- Delete Customer
- Customer Status Tracking

---

## Task Management

- Create Task
- Update Task
- Delete Task
- Update Task Status
- Assign Deadline
- Customer Relationship

---

## Notes

- Create Notes
- View Notes
- Delete Notes
- Customer Relationship

---

## Notifications

- Expo Push Notification
- Notification on Task Creation

---

## Security

- Password Hashing using bcrypt
- JWT Authentication
- Protected Routes
- Request Validation
- Centralized Error Handling

---

# Tech Stack

| Layer | Technology |
|--------|------------|
| Runtime | Node.js 20+ |
| Framework | Express.js 5 |
| Language | TypeScript 5 |
| ORM | Prisma ORM |
| Database | PostgreSQL |
| Authentication | JWT |
| Password Hashing | bcrypt |
| Email | Nodemailer |
| Push Notifications | Expo Server SDK |
| Containerization | Docker & Docker Compose |
| Testing | Jest + Supertest |
| Validation | express-validator |
| API Style | RESTful API |

---

# Folder Structure

```
.
├── docs/
│   └── api.md
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── __tests__/
│   ├── constants/
│   ├── controllers/
│   ├── middlewares/
│   ├── prisma/
│   ├── routes/
│   ├── types/
│   ├── utils/
│   ├── validators/
│   ├── app.ts
│   └── index.ts
│
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

# Installation

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Docker (Optional)

---

## Clone Repository

```bash
git clone https://github.com/DukKhanh/crm-backend.git

cd crm-backend
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

```bash
cp .env.example .env
```

Update the values inside `.env`.

---

## Generate Prisma Client

```bash
npm run db:generate
```

---

## Run Database Migration

```bash
npm run db:migrate
```

---

## Start Development Server

```bash
npm run dev
```

The API will be available at

```
http://localhost:3000
```

---

# Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Application Port |
| DATABASE_URL | PostgreSQL Connection String |
| JWT_SECRET | JWT Secret |
| JWT_EXPIRES_IN | Access Token Expiration |
| JWT_REFRESH_EXPIRES_IN | Refresh Token Expiration |
| MAIL_USER | Gmail Account |
| MAIL_PASS | Gmail App Password |
| MAIL_FROM | Sender Name |

---

# Docker

Build & Run

```bash
docker-compose up --build
```

Background

```bash
docker-compose up -d
```

Stop

```bash
docker-compose down
```

Apply migrations

```bash
docker-compose exec app npx prisma migrate deploy
```

---

# Running Tests

```bash
npm test
```

Generate coverage

```bash
npm run test:coverage
```

Integration tests are written using **Jest** and **Supertest**.

---

# API Overview

| Module | Endpoint | Authentication |
|---------|----------|:--------------:|
| Auth | `/api/auth` | ❌ |
| Customers | `/api/customers` | ✅ |
| Tasks | `/api/tasks` | ✅ |
| Notes | `/api/notes` | ✅ |
| Profile | `/api/profile` | ✅ |

Complete API documentation is available in:

```
docs/api.md
```

---

# Authentication Flow

```text
Register
     │
     ▼
 Login
     │
     ▼
Receive Access Token + Refresh Token
     │
     ▼
Access Protected APIs
     │
     ▼
Access Token Expired?
     │
     ├── No → Continue
     │
     └── Yes
            │
            ▼
Refresh Token
            │
            ▼
New Access Token
```

Forgot Password Flow

```text
Forgot Password

      │

      ▼

OTP sent to Email

      │

      ▼

Verify OTP

      │

      ▼

Reset Password
```

---

# Database Schema

```text
User
├── id
├── full_name
├── email
├── password_hash
├── avatar
├── role
└── expoPushToken

Customer
├── id
├── name
├── phone
├── email
├── company
├── address
└── status

Task
├── id
├── title
├── description
├── deadline
├── status
└── customer_id

Note
├── id
├── content
└── customer_id
```

Relations

```
Customer

├── Tasks (One-to-Many)

└── Notes (One-to-Many)
```

---


# Future Improvements

- Add Swagger/OpenAPI Documentation
- Implement Role-Based Access Control
- Refresh Token Rotation
- Pagination & Filtering
- Redis Cache
- API Rate Limiting
- Winston Logging
- GitHub Actions CI/CD
- Cloudinary File Upload
- Unit Tests with Mocked Prisma
- WebSocket Real-time Notifications

---

# Why This Project?

This project was built to practice designing and implementing a production-style backend application using modern Node.js technologies.

Instead of focusing solely on CRUD operations, it includes authentication, email verification, push notifications, Dockerized deployment, integration testing, and production-oriented project structure to simulate a real-world backend service.

---

# License

This project is licensed under the MIT License.

---

# Author

**Le Duc Khanh**

- GitHub: https://github.com/DukKhanh
- Email: leduckhanh280804@gmail.com
- LinkedIn: https://www.linkedin.com/in/ldk288