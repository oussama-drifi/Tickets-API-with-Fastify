# Commercial Module

**Location**: `src/controllers/commercialController.js` | `src/routes/commercialRoutes.js`

## Purpose

Provides endpoints for commercial users (non-admin) to manage their own tickets, cards, payments, and profile information. All routes require authentication with the commercial user role.

## Key Features

- Profile update for commercial users
- Ticket creation and management
- Access to personal ticket images
- Card management (view cards)
- Payment creation and tracking
- Card category browsing

## Authorization

All endpoints require:
1. Valid JWT token
2. Commercial user role (or higher)

## API Endpoints

### Profile Management

#### PATCH `/api/commercials/profile`
**Description**: Update current commercial user's profile

**Request Body**:
```json
{
  "name": "Commercial Name",
  "email": "commercial@example.com",
  "phone": "+1234567890"
}
```

**Response** (200):
```json
{
  "id": 1,
  "email": "commercial@example.com",
  "name": "Commercial Name",
  "phone": "+1234567890",
  "status": "active",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

### Ticket Management

#### GET `/api/commercials/tickets`
**Description**: Get all tickets created by current commercial user

**Query Parameters**:
- `status`: Filter by status (pending, approved, rejected, completed)
- `page`: Pagination

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "title": "Ticket Title",
      "description": "Ticket description",
      "status": "pending",
      "imageUrl": "s3-url",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "page": 1
}
```

---

#### GET `/api/commercials/tickets/:id/image`
**Description**: Download image for a specific ticket

**Response** (200): Image file (PNG, JPG, etc.)

**Error Responses**:
- `404`: Ticket not found
- `403`: Not authorized to access this ticket

---

#### POST `/api/commercials/tickets`
**Description**: Create new ticket with optional image upload

**Request** (multipart/form-data):
```
- title: string (required)
- description: string
- image: file (optional, max 5MB)
```

**Response** (201):
```json
{
  "id": 1,
  "title": "New Ticket",
  "description": "Description",
  "status": "pending",
  "imageUrl": "s3-url",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### Cards Management

#### GET `/api/commercials/cards`
**Description**: Get all cards assigned to current commercial user

**Response** (200):
```json
[
  {
    "id": 1,
    "cardNumber": "****1234",
    "cardCategoryId": 1,
    "balance": 1000.00,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### Card Categories

#### GET `/api/commercials/card-categories`
**Description**: List all available card categories

**Response** (200):
```json
[
  {
    "id": 1,
    "name": "Visa",
    "description": "Visa credit cards",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### Payments Management

#### GET `/api/commercials/payments`
**Description**: Get all payment transactions for current user

**Query Parameters**:
- `status`: Filter by status (pending, approved, rejected)
- `page`: Pagination

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "amount": 500.00,
      "status": "pending",
      "paymentMethod": "card",
      "description": "Payment description",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 5,
  "page": 1
}
```

---

#### POST `/api/commercials/payments`
**Description**: Create new payment transaction

**Request Body**:
```json
{
  "amount": 500.00,
  "paymentMethod": "card",
  "cardId": 1,
  "description": "Payment for services"
}
```

**Response** (201):
```json
{
  "id": 1,
  "amount": 500.00,
  "status": "pending",
  "paymentMethod": "card",
  "cardId": 1,
  "description": "Payment for services",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## Error Responses

- `400`: Bad Request (invalid data)
- `401`: Unauthorized
- `403`: Forbidden (accessing other user's data)
- `404`: Not Found
- `413`: Payload Too Large (file exceeds 5MB)
- `500`: Server Error

## Image Upload

- **Supported formats**: PNG, JPG, JPEG, GIF
- **Max file size**: 5MB
- **Storage**: AWS S3
- **Access**: Via presigned URLs in responses
