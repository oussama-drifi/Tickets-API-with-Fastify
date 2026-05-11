# Admin Module

**Location**: `src/controllers/adminController.js` | `src/routes/adminRoutes.js`

## Purpose

Provides administrative endpoints for managing commercials, tickets, cards, card categories, and payments. All routes require admin authentication.

## Key Features

- CRUD operations for commercials
- Ticket management and status updates
- Card and card category management
- Payment approval/rejection workflow
- Image upload for tickets
- Search and filtering capabilities

## Authorization

All endpoints require:
1. Valid JWT token
2. Admin role verification

## API Endpoints

### Commercials Management

#### GET `/api/admin/commercials`
**Description**: List all commercials with pagination and filtering

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Commercial Name",
      "description": "Description",
      "status": "active",
      "userId": 1,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 10
}
```

---

#### GET `/api/admin/commercials/search`
**Description**: Search commercials by name or description

**Query Parameters**:
- `q`: Search query

**Response** (200): Array of matching commercials

---

#### GET `/api/admin/commercials/:id`
**Description**: Get commercial details by ID

**Response** (200): Commercial object with all details

---

#### GET `/api/admin/commercials/:id/tickets`
**Description**: Get all tickets for a specific commercial

**Response** (200): Array of tickets

---

#### POST `/api/admin/commercials`
**Description**: Create new commercial

**Request Body**:
```json
{
  "name": "New Commercial",
  "description": "Description",
  "userId": 1
}
```

**Response** (201): Created commercial object

---

#### PATCH `/api/admin/commercials/:id`
**Description**: Update commercial details

**Request Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "active" | "inactive"
}
```

**Response** (200): Updated commercial object

---

### Tickets Management

#### GET `/api/admin/tickets`
**Description**: List all tickets with status and filtering

**Query Parameters**:
- `status`: Filter by status
- `page`: Pagination

**Response** (200): Array of tickets

---

#### GET `/api/admin/tickets/:id/image`
**Description**: Download ticket image

**Response** (200): Image file

---

#### PATCH `/api/admin/tickets/:id/status`
**Description**: Update ticket status

**Request Body**:
```json
{
  "status": "pending" | "approved" | "rejected" | "completed"
}
```

**Response** (200): Updated ticket object

---

### Cards Management

#### GET `/api/admin/cards`
**Description**: List all cards

**Response** (200): Array of card objects

---

#### POST `/api/admin/cards`
**Description**: Create new card

**Request Body**:
```json
{
  "cardNumber": "1234567890123456",
  "cardCategoryId": 1,
  "balance": 1000
}
```

**Response** (201): Created card object

---

#### PATCH `/api/admin/cards/:id/status`
**Description**: Update card status

**Request Body**:
```json
{
  "status": "active" | "suspended" | "expired"
}
```

**Response** (200): Updated card object

---

#### PATCH `/api/admin/cards/:id/balance`
**Description**: Top up card balance

**Request Body**:
```json
{
  "amount": 500
}
```

**Response** (200): Updated card with new balance

---

### Card Categories Management

#### GET `/api/admin/card-categories`
**Description**: List all card categories

**Response** (200): Array of card category objects

---

#### POST `/api/admin/card-categories`
**Description**: Create new card category

**Request Body**:
```json
{
  "name": "Visa",
  "description": "Visa cards"
}
```

**Response** (201): Created category object

---

#### PATCH `/api/admin/card-categories/:id`
**Description**: Update card category

**Request Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response** (200): Updated category object

---

#### DELETE `/api/admin/card-categories/:id`
**Description**: Delete card category

**Response** (204): No content

---

### Payments Management

#### GET `/api/admin/payments`
**Description**: List all payments with status filtering

**Query Parameters**:
- `status`: pending | approved | rejected
- `page`: Pagination

**Response** (200): Array of payment objects

---

#### PATCH `/api/admin/payments/:id/approve`
**Description**: Approve pending payment

**Response** (200): Updated payment with approved status

---

#### PATCH `/api/admin/payments/:id/reject`
**Description**: Reject pending payment

**Request Body**:
```json
{
  "reason": "Optional rejection reason"
}
```

**Response** (200): Updated payment with rejected status

---

#### DELETE `/api/admin/payments/:id`
**Description**: Cancel payment

**Response** (204): No content

---

## Status Codes

- `200`: Success
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: Not Found
- `500`: Server Error
