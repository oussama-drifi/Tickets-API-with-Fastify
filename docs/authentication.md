# Authentication Module

**Location**: `src/controllers/authController.js` | `src/routes/authRoutes.js`

## Purpose

Handles user authentication including login and retrieving current user information. Uses JWT tokens for session management with bcrypt for password hashing.

## Key Features

- User login with email and password
- Password verification using bcrypt
- JWT token generation (24h expiration)
- Account suspension checks
- Current user information retrieval

## API Endpoints

### POST `/api/auth/login`
**Description**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin" | "commercial"
  }
}
```

**Error Responses**:
- `401`: Invalid email or password
- `403`: Account is suspended

---

### GET `/api/auth/me`
**Description**: Get current authenticated user information

**Required**: JWT token in Authorization header

**Response** (200):
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "admin" | "commercial",
  "status": "active" | "suspended",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses**:
- `401`: Unauthorized (invalid/missing token)
- `404`: User not found

## Authentication Middleware

The `fastify.authenticate` hook is used to verify JWT tokens on protected routes. All routes except login require authentication.

## Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 24 hours
- Account suspension prevents login
- Sensitive fields (password) excluded from user responses
