# CRM Connect Backend API

A production-ready CRM backend built with **Node.js**, **Express.js**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**. The project follows a modular architecture and focuses on secure authentication, scalable RESTful APIs, and modern backend development practices.

> This project was developed as a personal learning project to gain hands-on experience in designing, implementing, testing, and deploying a real-world backend application.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Authentication Flow](#authentication-flow)
- [API Modules](#api-modules)
- [Security Features](#security-features)
- [Testing](#testing)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Running with Docker](#running-with-docker)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)
- [Author](#author)

---

# Features

## Authentication

- User Registration
- User Login
- JWT Authentication
- Refresh Token Rotation
- Session Management
- Secure Logout
- Role-Based Authorization
- OTP Password Recovery
- Password Reset
- Refresh Token Reuse Detection

---

## Customer Management

- Create Customer
- Update Customer
- Delete Customer
- Search Customer
- Pagination
- Filtering

---

## Task Management

- Create Task
- Update Task
- Delete Task
- Task Status
- Task Priority

---

## Note Management

- Create Notes
- Update Notes
- Delete Notes

---

## Profile Management

- View Profile
- Update Profile
- Avatar Upload

---

## Validation

- Request Validation with Zod
- Centralized Validation Errors

---

## Logging

- Security Event Logging
- Error Logging

---

# Architecture

The project follows a modular architecture to improve maintainability and scalability.

```
Client
   │
REST API
   │
Express Router
   │
Controllers
   │
Services
   │
Prisma ORM
   │
PostgreSQL
```

Each layer has a single responsibility.

- Routes handle endpoint definitions.
- Controllers process HTTP requests.
- Services contain business logic.
- Prisma communicates with the database.

---

# Technology Stack

## Backend

- Node.js
- Express.js
- TypeScript

## Database

- PostgreSQL
- Prisma ORM

## Authentication

- JWT
- Refresh Token Rotation
- Bcrypt

## Validation

- Zod

## Testing

- Jest
- Supertest

## Security

- Helmet
- CORS
- Rate Limiter

## Deployment

- Docker
- Docker Compose
- Render
- Supabase

## Development Tools

- Git
- GitHub
- VS Code
- Postman
- Swagger
- ChatGPT
- Cursor

---

# Project Structure

```
src
│
├── config
├── controllers
├── middlewares
├── prisma
├── routes
├── schemas
├── services
├── types
├── utils
├── validations
├── tests
└── server.ts
```

---

# Authentication Flow

```
User Login
      │
      ▼
Verify Credentials
      │
      ▼
Generate Access Token
      │
      ▼
Generate Refresh Token
      │
      ▼
Store Session
      │
      ▼
Return Tokens
```

When the access token expires:

```
Refresh Token
      │
      ▼
Verify Session
      │
      ▼
Rotate Refresh Token
      │
      ▼
Issue New Tokens
```

---

# API Modules

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | /auth/register |
| POST | /auth/login |
| POST | /auth/refresh |
| POST | /auth/logout |
| POST | /auth/request-otp |
| POST | /auth/reset-password |

---

## Customers

| Method | Endpoint |
|---------|----------|
| GET | /customers |
| GET | /customers/:id |
| POST | /customers |
| PUT | /customers/:id |
| DELETE | /customers/:id |

---

## Tasks

| Method | Endpoint |
|---------|----------|
| GET | /tasks |
| GET | /tasks/:id |
| POST | /tasks |
| PUT | /tasks/:id |
| DELETE | /tasks/:id |

---

## Notes

| Method | Endpoint |
|---------|----------|
| GET | /notes |
| POST | /notes |
| PUT | /notes/:id |
| DELETE | /notes/:id |

---

## Profile

| Method | Endpoint |
|---------|----------|
| GET | /profile |
| PUT | /profile |

---

# Security Features

This project implements multiple security best practices.

## JWT Authentication

- Access Token
- Refresh Token

---

## Refresh Token Rotation

Each refresh request generates a brand-new refresh token.

Old refresh tokens become invalid immediately.

---

## Refresh Token Reuse Detection

Detects stolen refresh tokens.

If token reuse is detected:

- Revoke active sessions
- Log security event

---

## Password Hashing

Passwords are hashed using bcrypt before being stored.

---

## OTP Password Recovery

Users can securely reset passwords through email verification.

---

## Rate Limiting

Protects authentication endpoints against brute-force attacks.

---

## Helmet

Adds secure HTTP headers.

---

## CORS

Configurable Cross-Origin Resource Sharing.

---

# Testing

Integration tests are implemented using:

- Jest
- Supertest

Example test cases:

- User Registration
- Login
- Refresh Token
- Logout
- Protected Routes

Run tests:

```bash
npm test
```

Coverage

```bash
npm run test:coverage
```

---

# Getting Started

Clone repository

```bash
git clone https://github.com/DukKhanh/crm-backend.git
```

Move into project

```bash
cd crm-backend
```

Install packages

```bash
npm install
```

Generate Prisma Client

```bash
npx prisma generate
```

Run Migration

```bash
npx prisma migrate dev
```

Start development

```bash
npm run dev
```

---

# Environment Variables

Create a `.env` file.

```env
PORT=3000

DATABASE_URL=

JWT_ACCESS_SECRET=

JWT_REFRESH_SECRET=

ACCESS_TOKEN_EXPIRES_IN=

REFRESH_TOKEN_EXPIRES_IN=

EMAIL_USER=

EMAIL_PASS=

CLIENT_URL=
```

---

# Database

Generate Prisma Client

```bash
npx prisma generate
```

Create migration

```bash
npx prisma migrate dev
```

Open Prisma Studio

```bash
npx prisma studio
```

---

# Running with Docker

Build containers

```bash
docker compose build
```

Run

```bash
docker compose up
```

Stop

```bash
docker compose down
```

---

# Deployment

Backend

- Render

Database

- Supabase PostgreSQL

Deployment workflow

```
GitHub

↓

Render Build

↓

Docker Container

↓

Express Server

↓

Supabase PostgreSQL
```

---

# Development Workflow

```
Feature Branch

↓

Development

↓

Testing

↓

Git Commit

↓

Push GitHub

↓

Deploy
```

---

# Future Improvements

- Email Verification
- Redis Caching
- Background Jobs
- WebSocket Notifications
- API Versioning
- Audit Logs
- File Storage with Cloudinary
- OpenAPI Documentation
- CI/CD Pipeline using GitHub Actions
- Docker Production Optimization
- Monitoring with Prometheus & Grafana

---

# Learning Outcomes

Through this project, I gained practical experience in:

- RESTful API Design
- Authentication & Authorization
- Refresh Token Rotation
- Secure Session Management
- Backend Architecture
- Prisma ORM
- PostgreSQL
- Docker
- Deployment
- API Testing
- Software Security
- Error Handling
- AI-assisted Development using ChatGPT and Cursor

---

# Author

**Le Duc Khanh**

- Email: leduckhanh280804@gmail.com
- LinkedIn: https://linkedin.com/in/ldk288
- GitHub: https://github.com/DukKhanh

---

## License

This project is developed for educational and portfolio purposes.
