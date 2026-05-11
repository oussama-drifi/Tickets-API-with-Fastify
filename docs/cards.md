# Cards Module

**Location**: `src/controllers/cardController.js` | `src/routes/adminRoutes.js` & `src/routes/commercialRoutes.js`

## Purpose

Handles all card-related operations including creation, status management, balance updates, and retrieval. Cards are associated with card categories and have balance tracking.

## Key Features

- Card creation with category assignment
- Balance management and top-ups
- Card status tracking (active, suspended, expired)
- Card number masking for security
- Role-based access (admins see all, commercials see their own)

## API Endpoints

### Admin Endpoints

#### GET `/api/admin/cards`
**Description**: List all cards in the system

**Query Parameters**:
- `page`: Pagination
- `limit`: Items per page
- `status`: Filter by status
- `cardCategoryId`: Filter by category

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "cardNumber": "****1234",
      "maskedCardNumber": "****1234",
      "cardCategoryId": 1,
      "balance": 1000.00,
      "status": "active",
      "userId": 1,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "page": 1
}
```

---

#### POST `/api/admin/cards`
**Description**: Create new card

**Request Body**:
```json
{
  "cardNumber": "1234567890123456",
  "cardCategoryId": 1,
  "userId": 5,
  "balance": 1000.00
}
```

**Validation**:
- Card number must be 16 digits
- Card category must exist
- User must exist
- Initial balance must be positive

**Response** (201):
```json
{
  "id": 1,
  "cardNumber": "****1234",
  "cardCategoryId": 1,
  "balance": 1000.00,
  "status": "active",
  "userId": 5,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

#### PATCH `/api/admin/cards/:id/status`
**Description**: Update card status

**Request Body**:
```json
{
  "status": "active" | "suspended" | "expired"
}
```

**Response** (200):
```json
{
  "id": 1,
  "status": "suspended",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

#### PATCH `/api/admin/cards/:id/balance`
**Description**: Add funds to card (top-up)

**Request Body**:
```json
{
  "amount": 500.00
}
```

**Response** (200):
```json
{
  "id": 1,
  "previousBalance": 1000.00,
  "amount": 500.00,
  "newBalance": 1500.00,
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

### Commercial Endpoints

#### GET `/api/commercials/cards`
**Description**: Get cards assigned to current commercial user

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

## Card Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | number | Unique card identifier |
| `cardNumber` | string | Card number (stored masked) |
| `cardCategoryId` | number | Reference to card category |
| `balance` | decimal | Current card balance |
| `status` | enum | active, suspended, expired |
| `userId` | number | Owner user ID |
| `createdAt` | date | Card creation timestamp |
| `updatedAt` | date | Last update timestamp |

## Error Responses

- `400`: Bad Request (invalid card number, negative balance)
- `401`: Unauthorized
- `403`: Forbidden (accessing other user's card)
- `404`: Card not found
- `409`: Conflict (card category doesn't exist)
- `500`: Server Error

## Security Features

- Card numbers are masked in responses (only last 4 digits visible)
- Full card numbers stored securely in database
- Balance operations are transactional
- Access control enforced per user role
