# API Reference

Base URL: `http://localhost:3000/api`

All protected routes require the header:
```
Authorization: Bearer <access_token>
```

---

## Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register a new user |
| POST | `/auth/login` | ❌ | Login and receive tokens |
| POST | `/auth/refresh` | ❌ | Exchange a refresh token for a new access token |
| POST | `/auth/forgot-password` | ❌ | Send OTP code to email |
| POST | `/auth/reset-password` | ❌ | Reset password with OTP |

### POST `/auth/register`
**Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "Employee"
}
```
**Response `201`:**
```json
{ "message": "Registration successful", "userId": "<uuid>" }
```

### POST `/auth/login`
**Body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```
**Response `200`:**
```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "refreshToken": "<jwt>",
  "user": { "id": "...", "full_name": "...", "email": "...", "role": "...", "avatar": null }
}
```

### POST `/auth/refresh`
**Body:** `{ "refreshToken": "<jwt>" }`
**Response `200`:** `{ "token": "<new_jwt>" }`

### POST `/auth/forgot-password`
**Body:** `{ "email": "john@example.com" }`
**Response `200`:** `{ "message": "OTP code sent to your email" }`

### POST `/auth/reset-password`
**Body:** `{ "email": "john@example.com", "otp": "123456", "newPassword": "newSecret" }`
**Response `200`:** `{ "message": "Password reset successful" }`

---

## Customers (`/api/customers`) 🔒

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List all customers |
| GET | `/customers/:id` | Get a single customer (with tasks & notes) |
| POST | `/customers` | Create a customer |
| PUT | `/customers/:id` | Update a customer |
| DELETE | `/customers/:id` | Delete a customer |

### Customer Object
```json
{
  "id": "<uuid>",
  "name": "Acme Corp",
  "phone": "0901234567",
  "email": "contact@acme.com",
  "company": "Acme",
  "address": "123 Street",
  "status": "New",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Customer statuses:** `New` | `Contacted` | `Converted` | `Lost`

---

## Tasks (`/api/tasks`) 🔒

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List all tasks (includes customer name) |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update task status |
| PUT | `/tasks/:id/edit` | Update task details |
| DELETE | `/tasks/:id` | Delete a task |

### POST `/tasks`
**Body:**
```json
{
  "title": "Follow up call",
  "description": "Call client about proposal",
  "deadline": "2024-12-31T00:00:00.000Z",
  "customer_id": "<uuid>"
}
```

### PUT `/tasks/:id`
**Body:** `{ "status": "Completed" }`

**Task statuses:** `Pending` | `In Progress` | `Completed`

---

## Profile (`/api/profile`) 🔒

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get current user's profile |
| PUT | `/profile` | Update profile (name, avatar) |
| PUT | `/profile/change-password` | Change password |
| PUT | `/profile/push-token` | Save Expo push notification token |

### PUT `/profile/change-password`
**Body:** `{ "oldPassword": "old", "newPassword": "new" }`

---

## Notes (`/api/notes`) 🔒

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/notes` | Create a note linked to a customer |

### POST `/notes`
**Body:** `{ "customer_id": "<uuid>", "content": "Spoke to the client today." }`

---

## Error Response Format

All errors return a consistent JSON body:
```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (expired refresh token) |
| 404 | Not Found |
| 500 | Internal Server Error |
