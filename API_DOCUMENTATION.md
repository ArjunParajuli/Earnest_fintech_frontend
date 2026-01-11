# Earnest Fintech Backend API Documentation

## Overview

RESTful API built with Express.js, TypeScript, Prisma, and PostgreSQL. Features JWT-based authentication and task management with CRUD operations.

**Base URL**: `http://localhost:3000`

---

## Table of Contents

- [Authentication](#authentication)
- [Task Management](#task-management)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Error Responses](#error-responses)

---

## Authentication

All task endpoints require authentication via JWT access token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

### POST /auth/register

Register a new user account.

**Request:**
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"  // optional
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-01-10T12:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Error Responses:**
- `400` - Validation error (missing fields, invalid email, password < 6 chars)
- `409` - User already exists
- `500` - Internal server error

---

### POST /auth/login

Authenticate user and get access/refresh tokens.

**Request:**
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid email or password
- `500` - Internal server error

---

### POST /auth/refresh

Get a new access token using refresh token.

**Request:**
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "message": "Token refreshed successfully",
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Error Responses:**
- `400` - Refresh token missing
- `401` - Invalid or expired refresh token, or token revoked (user logged out)
- `500` - Internal server error

**Token Expiration:**
- Access Token: 15 minutes
- Refresh Token: 7 days

---

### POST /auth/logout

Invalidate refresh token and log out user.

**Request:**
- **Headers:** 
  - `Authorization: Bearer <access_token>`
  - `Content-Type: application/json`

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `401` - Missing or invalid access token
- `500` - Internal server error

**Note:** Access tokens cannot be revoked (stateless), but clearing refresh token prevents getting new access tokens.

---

### GET /auth/me

Get current authenticated user information.

**Request:**
- **Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-01-10T12:00:00.000Z",
    "updatedAt": "2026-01-10T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Missing or invalid access token
- `404` - User not found
- `500` - Internal server error

---

## Task Management

All task endpoints require authentication. Users can only access/modify their own tasks.

---

### GET /tasks

Get paginated list of tasks with optional filtering and search.

**Request:**
- **Headers:** `Authorization: Bearer <access_token>`
- **Query Parameters:**
  - `page` (optional, default: 1) - Page number
  - `limit` (optional, default: 10) - Items per page
  - `status` (optional) - Filter by status: `PENDING`, `IN_PROGRESS`, `COMPLETED`
  - `search` (optional) - Search by title (case-insensitive partial match)

**Example:**
```
GET /tasks?page=1&limit=10&status=COMPLETED&search=meeting
```

**Response (200 OK):**
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Complete assignment",
      "description": "Finish the task management feature",
      "status": "COMPLETED",
      "userId": 1,
      "createdAt": "2026-01-10T12:00:00.000Z",
      "updatedAt": "2026-01-10T13:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Error Responses:**
- `401` - Missing or invalid access token
- `500` - Internal server error

---

### POST /tasks

Create a new task.

**Request:**
- **Headers:** 
  - `Authorization: Bearer <access_token>`
  - `Content-Type: application/json`
- **Body:**
```json
{
  "title": "Complete assignment",  // required, min 1 character
  "description": "Finish the task management feature",  // optional
  "status": "PENDING"  // optional, defaults to "PENDING", must be: PENDING, IN_PROGRESS, or COMPLETED
}
```

**Response (201 Created):**
```json
{
  "message": "Task created successfully",
  "task": {
    "id": 1,
    "title": "Complete assignment",
    "description": "Finish the task management feature",
    "status": "PENDING",
    "userId": 1,
    "createdAt": "2026-01-10T12:00:00.000Z",
    "updatedAt": "2026-01-10T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation error (missing title, empty title, invalid status)
- `401` - Missing or invalid access token
- `500` - Internal server error

---

### GET /tasks/:id

Get a specific task by ID.

**Request:**
- **Headers:** `Authorization: Bearer <access_token>`
- **Path Parameters:**
  - `id` (required) - Task ID (integer)

**Example:**
```
GET /tasks/1
```

**Response (200 OK):**
```json
{
  "task": {
    "id": 1,
    "title": "Complete assignment",
    "description": "Finish the task management feature",
    "status": "PENDING",
    "userId": 1,
    "createdAt": "2026-01-10T12:00:00.000Z",
    "updatedAt": "2026-01-10T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid task ID
- `401` - Missing or invalid access token
- `404` - Task not found or doesn't belong to user
- `500` - Internal server error

---

### PATCH /tasks/:id

Update a task (partial update - only send fields to update).

**Request:**
- **Headers:** 
  - `Authorization: Bearer <access_token>`
  - `Content-Type: application/json`
- **Path Parameters:**
  - `id` (required) - Task ID (integer)
- **Body:** (all fields optional)
```json
{
  "title": "Updated title",  // optional, min 1 character if provided
  "description": "Updated description",  // optional, can be null
  "status": "IN_PROGRESS"  // optional, must be: PENDING, IN_PROGRESS, or COMPLETED
}
```

**Example:**
```
PATCH /tasks/1
```

**Response (200 OK):**
```json
{
  "message": "Task updated successfully",
  "task": {
    "id": 1,
    "title": "Updated title",
    "description": "Updated description",
    "status": "IN_PROGRESS",
    "userId": 1,
    "createdAt": "2026-01-10T12:00:00.000Z",
    "updatedAt": "2026-01-10T14:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid task ID, empty title, or invalid status
- `401` - Missing or invalid access token
- `404` - Task not found or doesn't belong to user
- `500` - Internal server error

---

### DELETE /tasks/:id

Delete a task.

**Request:**
- **Headers:** `Authorization: Bearer <access_token>`
- **Path Parameters:**
  - `id` (required) - Task ID (integer)

**Example:**
```
DELETE /tasks/1
```

**Response (200 OK):**
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses:**
- `400` - Invalid task ID
- `401` - Missing or invalid access token
- `404` - Task not found or doesn't belong to user
- `500` - Internal server error

---

### POST /tasks/:id/toggle

Toggle task status through the cycle: PENDING → IN_PROGRESS → COMPLETED → PENDING

**Request:**
- **Headers:** `Authorization: Bearer <access_token>`
- **Path Parameters:**
  - `id` (required) - Task ID (integer)

**Example:**
```
POST /tasks/1/toggle
```

**Response (200 OK):**
```json
{
  "message": "Task status toggled successfully",
  "task": {
    "id": 1,
    "title": "Complete assignment",
    "description": "Finish the task management feature",
    "status": "IN_PROGRESS",
    "userId": 1,
    "createdAt": "2026-01-10T12:00:00.000Z",
    "updatedAt": "2026-01-10T14:00:00.000Z"
  }
}
```

**Status Toggle Cycle:**
- `PENDING` → `IN_PROGRESS`
- `IN_PROGRESS` → `COMPLETED`
- `COMPLETED` → `PENDING`

**Error Responses:**
- `400` - Invalid task ID
- `401` - Missing or invalid access token
- `404` - Task not found or doesn't belong to user
- `500` - Internal server error

---

## Database Schema

### User Model

```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  password     String   // Hashed with bcrypt
  name         String?
  refreshToken String?  // Stored refresh token for logout
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  tasks        Task[]   // One-to-many relationship with tasks

  @@map("users")
}
```

### Task Model

```prisma
model Task {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  status      TaskStatus @default(PENDING)
  userId      Int
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("tasks")
}
```

### TaskStatus Enum

```prisma
enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}
```

**Relationships:**
- User has many Tasks (one-to-many)
- Task belongs to one User (many-to-one)
- Cascade delete: When a user is deleted, all their tasks are automatically deleted

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# JWT Secrets (IMPORTANT: Use strong random strings in production!)
JWT_SECRET="your-secret-key-change-in-production-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-in-production-min-32-chars"

# Optional: Node Environment
NODE_ENV="development"
```

**Generate Strong Secrets:**
```bash
openssl rand -base64 32
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

### Common HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Validation error or invalid input
- `401 Unauthorized` - Missing or invalid authentication token
- `404 Not Found` - Resource not found or doesn't belong to user
- `409 Conflict` - Resource already exists (e.g., duplicate email)
- `500 Internal Server Error` - Server error

### Authentication Errors

**Missing Token:**
```json
{
  "error": "Authentication required",
  "message": "Please provide a valid access token in Authorization header"
}
```

**Invalid/Expired Token:**
```json
{
  "error": "Invalid or expired token",
  "message": "Please login again to get a new access token"
}
```

### Validation Errors

**Missing Required Field:**
```json
{
  "error": "Validation error",
  "message": "Title is required"
}
```

**Invalid Format:**
```json
{
  "error": "Validation error",
  "message": "Invalid email format"
}
```

### Not Found Errors

**Resource Not Found:**
```json
{
  "error": "Task not found",
  "message": "Task does not exist or you do not have permission to access it"
}
```

---

## Authentication Flow

1. **Register/Login** → Get `accessToken` and `refreshToken`
2. **Store tokens** in client (localStorage, sessionStorage, or HttpOnly cookies)
3. **Include access token** in `Authorization: Bearer <token>` header for protected routes
4. **When access token expires** (15 minutes) → Use `refreshToken` to get new `accessToken` via `/auth/refresh`
5. **On logout** → Call `/auth/logout` to invalidate refresh token, then delete tokens from client storage

---

## Quick Start Examples

### 1. Register and Login

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Create a Task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete assignment",
    "description": "Finish the task management feature",
    "status": "PENDING"
  }'
```

### 3. Get Tasks with Pagination and Filtering

```bash
curl -X GET "http://localhost:3000/tasks?page=1&limit=10&status=COMPLETED&search=meeting" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Toggle Task Status

```bash
curl -X POST http://localhost:3000/tasks/1/toggle \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Project Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── prisma.ts          # Prisma client setup
│   │   └── db.ts               # Database connection (legacy)
│   ├── middleware/
│   │   └── auth.ts             # Authentication middleware
│   ├── routes/
│   │   ├── auth.ts             # Authentication routes
│   │   └── tasks.ts            # Task management routes
│   ├── utils/
│   │   └── auth.ts             # JWT and password utilities
│   └── app.ts                  # Express app setup
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── generated/
│   └── prisma/                 # Generated Prisma client
└── package.json
```

---

## Technologies Used

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma 7
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** Built-in Express validation

---

**Last Updated:** January 10, 2026

