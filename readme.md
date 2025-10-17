# Custom ChatBot - Backend

## Project Overview
Backend API for AI Chat service with subscription management.

## Tech Stack
- Node.js + TypeScript
- Express.js
- PostgreSQL
- Prisma

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 16+

### Installation

1. Clone the repository
2. Install dependencies:
```bash
   npm install
```
3. Setup environment variables:
```bash
   cp .env.example .env
```
4. Start database:
```bash
   docker-compose up -d
```
5. Run migrations:
```bash
   npx prisma migrate dev --name init
```
6. Start development server:
```bash
   npm run dev
```

## API Routes

### Chat Routes
**Base URL:** `/chat`

- `POST /chat` - Send a message
- `GET /chat/user/:userId` - Get user chat history
- `GET /chat/user/:userId/quota` - Get user quota information

### Subscription Routes
**Base URL:** `/subscriptions`

- `POST /subscriptions` - Create a new subscription
- `GET /subscriptions/user/:userId` - Get all subscriptions for a user
- `GET /subscriptions/:id/user/:userId` - Get specific subscription by ID
- `DELETE /subscriptions/:id/user/:userId` - Cancel a subscription
- `PATCH /subscriptions/:id/user/:userId/auto-renew` - Toggle auto-renewal
- `GET /subscriptions/user/:userId/active` - Get active subscriptions

### Health Check
- `GET /health` - Server health status
