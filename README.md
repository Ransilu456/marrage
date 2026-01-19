# Marriage Platform

A modern, high-performance web application designed for matrimony services, featuring advanced user profiles, real-time communication, and a robust verification layer.

## 🚀 Features

- **Rich User Profiles**: Detailed lifestyle, family, and preference information.
- **Real-time Chat**: Pusher-powered real-time messaging system.
- **Interest System**: Proposal-based interaction requests (Phase 5).
- **Identity Verification**: Multi-factor verification (Email, Phone, Photo, ID) to build trust.
- **Admin Dashboard**: Comprehensive moderation tools for user and profile management.
- **Advanced Discovery**: Intelligent search and filtering by age, location, religion, etc.

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion.
- **Backend**: Next.js API Routes, Server Actions.
- **Database**: PostgreSQL (via Prisma ORM).
- **Authentication**: NextAuth.js (Credentials Provider).
- **Real-time**: Pusher.
- **Verification**: Pusher Beams for notifications.

## 📂 Project Structure

```text
├── app/                  # Next.js App Router (UI & APIs)
├── src/
│   ├── core/             # Domain Layer (Hexagonal Architecture)
│   │   ├── entities/     # Domain Models
│   │   ├── use-cases/    # Business Logic
│   │   └── interfaces/   # Repository Interfaces
│   ├── infrastructure/   # Adapters (Database, external services)
│   │   └── db/           # Prisma Implementation
│   └── lib/              # Shared utilities (Auth, Prisma client)
├── prisma/               # Database Schema
├── types/                # TypeScript global declarations
└── scripts/              # Automation and seeding scripts
```

## ⚙️ Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Copy `.env.example` to `.env` and fill in the required variables (DATABASE_URL, NEXTAUTH_SECRET, PUSHER_*, etc.).

3.  **Database Migration**:
    ```bash
    npx prisma migrate dev
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🧪 Testing

Run unit tests using Vitest:
```bash
npm test
```

## 🤖 Automation

Scripts for seeding data are located in the `scripts/` directory.
```bash
python scripts/user_seeding.py
```
