# Card Categories Module

**Location**: `src/controllers/cardCategoryController.js` | `src/routes/cardCategoryRoutes.js`

## Purpose

Manages card categories (e.g., Visa, Mastercard, etc.) that cards are classified into. Provides both public listing for authenticated users and admin management operations.

## Key Features

- Create card categories (admin only)
- Update category information (admin only)
- Delete categories (admin only)
- List categories (authenticated users)
- Reference for card classification

## API Endpoints

### Public Endpoints

#### GET `/api/card-categories`
**Description**: List all card categories (requires authentication)

**Response** (200):
```json
[
  {
    "id": 1,
    "name": "Visa",
    "description": "Visa credit and debit cards",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "name": "Mastercard",
    "description": "Mastercard credit and debit cards",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### Admin Endpoints

#### POST `/api/admin/card-categories`
**Description**: Create new card category

**Request Body**:
```json
{
  "name": "Visa",
  "description": "Visa credit and debit cards"
}
```

**Validation**:
- Name is required and must be unique
- Description is optional
- Name max length: 100 characters
- Description max length: 500 characters

**Response** (201):
```json
{
  "id": 1,
  "name": "Visa",
  "description": "Visa credit and debit cards",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

#### PATCH `/api/admin/card-categories/:id`
**Description**: Update card category details

**Request Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response** (200):
```json
{
  "id": 1,
  "name": "Updated Name",
  "description": "Updated description",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

#### DELETE `/api/admin/card-categories/:id`
**Description**: Delete card category

**Restrictions**:
- Cannot delete if cards are associated with this category
- Soft delete is recommended to prevent data loss

**Response** (204): No content

---

## Category Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | number | Unique category identifier |
| `name` | string | Category name (e.g., Visa) |
| `description` | string | Category description |
| `createdAt` | date | Creation timestamp |
| `updatedAt` | date | Last update timestamp |

## Common Categories

- **Visa**: Visa credit and debit cards
- **Mastercard**: Mastercard credit and debit cards
- **American Express**: Amex cards
- **Discover**: Discover cards
- **PayPal**: PayPal cards
- **Apple Pay**: Apple Pay digital cards
- **Google Pay**: Google Pay digital cards

## Error Responses

- `400`: Bad Request (missing required field, invalid data)
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: Category not found
- `409`: Conflict (category name already exists, cards depend on this category)
- `422`: Unprocessable Entity (validation failed)
- `500`: Server Error

## Access Control

- **GET** (list): Requires authentication
- **POST, PATCH, DELETE**: Requires admin role
