# Tickets API Documentation

This directory contains documentation for the Tickets API, a Fastify-based REST API for managing tickets, commercials, cards, and payments.

## Project Overview

- **Framework**: Fastify 5.x
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (via @fastify/jwt)
- **File Storage**: AWS S3
- **Port**: 3000 (default)

## Core Modules

1. **[Authentication Module](./authentication.md)** - User login and authentication
2. **[Admin Module](./admin-module.md)** - Administrative operations for commercials, tickets, cards, and payments
3. **[Commercial Module](./commercial-module.md)** - Commercial user operations
4. **[Card Module](./cards.md)** - Card management and balance operations
5. **[Card Category Module](./card-categories.md)** - Card category management
6. **[Payment Module](./payments.md)** - Payment processing and management

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints except `/auth/login` require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Database Schema

The application uses the following main models:
- **User**: Stores user information with roles (admin, commercial)
- **Commercial**: Commercial entities
- **Ticket**: Ticket records with image storage
- **Card**: Payment cards with balance tracking
- **CardCategory**: Categories for cards
- **Payment**: Payment transactions

## Running the Server

```bash
# Development
npm run dev

# Production
npm start
```
