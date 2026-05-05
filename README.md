# Tickets API

A ticket management REST API built with Fastify.

## Tech Stack

- **Fastify** — Web framework
- **Sequelize** — ORM
- **MySQL** — Database
- **JWT** — Authentication
- **Cloudflare R2** — Image storage (profiles & tickets)

## Getting Started

### Prerequisites
- Node.js (v20.19+ or v22.12+)
- MySQL

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file at the root with the following variables:

```env
PORT=3000
HOST=0.0.0.0
DB_NAME=ticket_system
DB_USER=root
DB_PASS=
DB_HOST=localhost
DB_PORT=8080
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_PROFILES_BUCKET=profiles
R2_PROFILES_PUBLIC_URL=https://profiles.your-domain.com
R2_TICKETS_BUCKET=tickets
R2_TICKETS_PUBLIC_URL=https://tickets.your-domain.com
```

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## Project Structure

```
Tickets-API-with-Fastify/
├── src/
│   ├── app.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── commercialController.js
│   │   ├── cardCategoryController.js
│   │   ├── cardController.js
│   │   └── paymentController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Ticket.js
│   │   ├── CardCategory.js
│   │   ├── Card.js
│   │   └── Payment.js
│   ├── plugins/
│   │   ├── db.js
│   │   ├── auth.js
│   │   ├── r2.js
│   │   └── upload.js
│   └── routes/
│       ├── authRoutes.js
│       ├── adminRoutes.js
│       └── commercialRoutes.js
├── server.js
├── test.http
└── package.json
```

## Data Models

### User

| Field            | Type                          | Notes                     |
|------------------|-------------------------------|---------------------------|
| id               | INTEGER (PK, auto-increment)  |                           |
| name             | STRING                        | required                  |
| email            | STRING                        | required, unique          |
| password         | STRING                        | required, hashed          |
| role             | ENUM(`admin`, `commercial`)   | default: `commercial`     |
| bio              | TEXT                          | nullable                  |
| status           | ENUM(`active`, `suspended`)   | nullable (null for admin) |
| profileImagePath | STRING                        | nullable                  |

### Ticket

| Field       | Type                                            | Notes              |
|-------------|-------------------------------------------------|--------------------|
| id          | INTEGER (PK, auto-increment)                    |                    |
| title       | STRING                                          | required           |
| description | TEXT                                            | optional           |
| amount      | DECIMAL(10,2)                                   | required           |
| imagePath   | STRING                                          | required           |
| category    | ENUM(`restaurant`, `hotel`, `work`)             | required           |
| status      | ENUM(`pending`, `verified`, `paid`, `rejected`) | default: `pending` |
| ticketDate  | DATE                                            | required           |
| userId      | INTEGER (FK -> User)                            |                    |

### CardCategory

| Field | Type                         | Notes    |
|-------|------------------------------|----------|
| id    | INTEGER (PK, auto-increment) |          |
| name  | STRING                       | required |

### Card

| Field      | Type                         | Notes                        |
|------------|------------------------------|------------------------------|
| id         | INTEGER (PK, auto-increment) |                              |
| balance    | DECIMAL(10,2)                | required                     |
| status     | ENUM(`active`, `blocked`)    | default: `active`            |
| categoryId | INTEGER (FK -> CardCategory) |                              |
| userId     | INTEGER (FK -> User)         | must be a commercial account |

### Payment

| Field        | Type                                              | Notes                           |
|--------------|---------------------------------------------------|---------------------------------|
| id           | INTEGER (PK, auto-increment)                      |                                 |
| amount       | DECIMAL(10,2)                                     | required                        |
| method       | ENUM(`card`, `cash`)                              | required                        |
| status       | ENUM(`in_review`, `success`, `cancelled`, `failed`) | default: `in_review`          |
| label        | STRING                                            | optional, set by commercial     |
| payment_code | STRING                                            | nullable, cash payments only    |
| card_id      | INTEGER (FK -> Card)                              | nullable, card payments only    |
| ticketId     | INTEGER (FK -> Ticket)                            |                                 |
| userId       | INTEGER (FK -> User)                              |                                 |

---

## API Endpoints

### Authentication

| Method | Endpoint          | Description  | Auth |
|--------|-------------------|--------------|------|
| POST   | `/api/auth/login` | Login        | No   |
| GET    | `/api/auth/me`    | Current user | Yes  |

#### `POST /api/auth/login`

**Body (JSON):**
```json
{ "email": "john@example.com", "password": "secret" }
```

**Response:**
```json
{
  "token": "eyJhbG...",
  "user": { "id": 1, "email": "john@example.com", "role": "commercial" }
}
```

---

### Admin (requires admin role)

#### Commercials

| Method | Endpoint                             | Description                |
|--------|--------------------------------------|----------------------------|
| GET    | `/api/admin/commercials`             | List all commercials       |
| GET    | `/api/admin/commercials/search`      | Search commercials by name |
| GET    | `/api/admin/commercials/:id`         | Get commercial details     |
| GET    | `/api/admin/commercials/:id/tickets` | Get commercial's tickets   |
| POST   | `/api/admin/commercials`             | Create commercial account  |
| PATCH  | `/api/admin/commercials/:id`         | Update commercial          |

#### Tickets

| Method | Endpoint                        | Description           |
|--------|---------------------------------|-----------------------|
| GET    | `/api/admin/tickets`            | List all tickets (paginated, filterable) |
| GET    | `/api/admin/tickets/:id/image`  | Get ticket image path |
| PATCH  | `/api/admin/tickets/:id/status` | Update ticket status  |

**`GET /api/admin/tickets` query params:** `status`, `category`, `dateFrom`, `dateTo`, `page`, `limit`

#### Card Categories

| Method | Endpoint                          | Description             |
|--------|-----------------------------------|-------------------------|
| GET    | `/api/admin/card-categories`      | List all categories     |
| POST   | `/api/admin/card-categories`      | Create category         |
| PATCH  | `/api/admin/card-categories/:id`  | Update category         |
| DELETE | `/api/admin/card-categories/:id`  | Delete category         |

#### Cards

| Method | Endpoint                     | Description                       |
|--------|------------------------------|-----------------------------------|
| GET    | `/api/admin/cards`           | List all cards (paginated)        |
| POST   | `/api/admin/cards`           | Create card for a commercial      |
| PATCH  | `/api/admin/cards/:id/status`| Block or unblock a card           |
| PATCH  | `/api/admin/cards/:id/balance`| Top up card balance              |

**`GET /api/admin/cards` query params:** `page`, `limit`

**`POST /api/admin/cards` body:**
```json
{ "user_id": 1, "category_id": 2, "balance": 500 }
```

**`PATCH /api/admin/cards/:id/status` body:**
```json
{ "status": "blocked" }
```

**`PATCH /api/admin/cards/:id/balance` body:**
```json
{ "amount": 200 }
```

#### Payments

| Method | Endpoint                          | Description                              |
|--------|-----------------------------------|------------------------------------------|
| GET    | `/api/admin/payments`             | List all payments (paginated, searchable)|
| PATCH  | `/api/admin/payments/:id/approve` | Approve a cash payment in review         |
| PATCH  | `/api/admin/payments/:id/reject`  | Reject a cash payment in review          |
| DELETE | `/api/admin/payments/:id`         | Cancel a successful payment              |

**`GET /api/admin/payments` query params:** `label` (partial match), `page`, `limit`

**Approve:** cash + `in_review` only → status becomes `success`, ticket → `paid`

**Reject:** cash + `in_review` only → status becomes `failed`, ticket unchanged

**Cancel:** `success` payments only → status becomes `cancelled`, ticket → `verified`, card balance restored if card payment

---

### Commercial (requires authentication)

#### Profile & Tickets

| Method | Endpoint                             | Description           |
|--------|--------------------------------------|-----------------------|
| PATCH  | `/api/commercials/profile`           | Update own profile    |
| GET    | `/api/commercials/tickets`           | List own tickets      |
| GET    | `/api/commercials/tickets/:id/image` | Get ticket image path |
| POST   | `/api/commercials/tickets`           | Create ticket         |

#### Cards

| Method | Endpoint               | Description      |
|--------|------------------------|------------------|
| GET    | `/api/commercials/cards` | List own cards |

#### Payments

| Method | Endpoint                      | Description           |
|--------|-------------------------------|-----------------------|
| GET    | `/api/commercials/payments`   | List own payments     |
| POST   | `/api/commercials/payments`   | Initiate a payment    |

**`POST /api/commercials/payments` body:**
```json
{
  "ticket_id": 1,
  "method": "card",
  "card_id": 3,
  "label": "Q1 expenses"
}
```
For cash payments, replace `card_id` with `payment_code` and omit `card_id`. `label` is optional for both methods.

**Card payment rules:** card must be active, balance must cover ticket amount, ticket must be `verified`. On success: balance deducted, ticket → `paid`, payment → `success`.

**Cash payment rules:** ticket must be `verified`. Payment goes to `in_review` for admin review. Ticket stays `verified` until admin approves.

---

### Health

| Method | Endpoint  | Description  |
|--------|-----------|--------------|
| GET    | `/health` | Health check |

## Docker

```bash
docker-compose up --build
```
