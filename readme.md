# [Your Full Name] - Backend Test

## Project Overview
Backend API for AI Chat service with subscription management.

## Tech Stack
- Node.js + TypeScript
- Express.js
- PostgreSQL
- TypeORM / Prisma

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
   npm install
```
3. Setup environment variables:
```bash
   cp .env.example .env
   # Update .env with your configuration
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
