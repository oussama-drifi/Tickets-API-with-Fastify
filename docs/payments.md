# Payments Module

**Location**: `src/controllers/paymentController.js` | `src/routes/adminRoutes.js` & `src/routes/commercialRoutes.js`

## Purpose

Manages payment transactions with approval workflow. Supports creation of payments by commercial users and admin approval/rejection of pending payments.

## Key Features

- Payment creation by commercial users
- Payment status tracking (pending, approved, rejected)
- Admin approval/rejection workflow
- Payment history and tracking
- Card-based payment processing
- Reason tracking for rejections

## API Endpoints

### Admin Endpoints

#### GET `/api/admin/payments`
**Description**: List all payments in the system with filtering and pagination

**Query Parameters**:
- `status`: Filter by status (pending, approved, rejected)
- `userId`: Filter by user ID
- `page`: Page number
- `limit`: Items per page
- `sortBy`: Sort field (createdAt, amount, status)
- `order`: asc or desc

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "amount": 500.00,
      "status": "pending",
      "paymentMethod": "card",
      "cardId": 1,
      "userId": 2,
      "description": "Payment for services",
      "rejectionReason": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "pages": 3
}
```

---

#### PATCH `/api/admin/payments/:id/approve`
**Description**: Approve pending payment

**Response** (200):
```json
{
  "id": 1,
  "amount": 500.00,
  "status": "approved",
  "approvedAt": "2024-01-01T12:00:00Z",
  "updatedAt": "2024-01-01T12:00:00Z"
}
```

**Error Responses**:
- `400`: Payment already processed
- `404`: Payment not found

---

#### PATCH `/api/admin/payments/:id/reject`
**Description**: Reject pending payment

**Request Body**:
```json
{
  "reason": "Insufficient funds in account"
}
```

**Response** (200):
```json
{
  "id": 1,
  "amount": 500.00,
  "status": "rejected",
  "rejectionReason": "Insufficient funds in account",
  "rejectedAt": "2024-01-01T12:00:00Z",
  "updatedAt": "2024-01-01T12:00:00Z"
}
```

---

#### DELETE `/api/admin/payments/:id`
**Description**: Cancel/delete a payment (typically pending payments)

**Response** (204): No content

---

### Commercial Endpoints

#### GET `/api/commercials/payments`
**Description**: Get all payment transactions for current commercial user

**Query Parameters**:
- `status`: Filter by status
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
      "cardId": 1,
      "description": "Payment for services",
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
  "description": "Optional payment description"
}
```

**Validation**:
- Amount must be positive
- Card must exist and belong to user
- Card status must be active
- Card must have sufficient balance
- Payment method must be valid

**Response** (201):
```json
{
  "id": 1,
  "amount": 500.00,
  "status": "pending",
  "paymentMethod": "card",
  "cardId": 1,
  "description": "Optional payment description",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## Payment Status Flow

```
[Pending] → [Approved] ✓
    ↓
[Rejected] ✗
```

1. **Pending**: Initial status when payment is created
2. **Approved**: Admin approves the payment, funds are processed
3. **Rejected**: Admin rejects the payment with optional reason

---

## Payment Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | number | Unique payment identifier |
| `amount` | decimal | Payment amount |
| `status` | enum | pending, approved, rejected |
| `paymentMethod` | string | Payment method (card, bank_transfer, etc.) |
| `cardId` | number | Associated card ID |
| `userId` | number | User who created payment |
| `description` | string | Optional payment description |
| `rejectionReason` | string | Reason for rejection if rejected |
| `createdAt` | date | Creation timestamp |
| `updatedAt` | date | Last update timestamp |

---

## Payment Methods Supported

- `card`: Payment via card
- `bank_transfer`: Bank transfer
- `digital_wallet`: Digital payment wallets

---

## Error Responses

- `400`: Bad Request (invalid amount, validation failed)
- `401`: Unauthorized
- `403`: Forbidden (accessing other user's payment)
- `404`: Payment or Card not found
- `422`: Unprocessable Entity (card has insufficient balance, card suspended)
- `500`: Server Error

---

## Security & Auditing

- All payments are immutable once approved/rejected
- Rejection reasons are tracked for audit purposes
- Payment history is retained for compliance
- Balance deduction is atomic and transactional
