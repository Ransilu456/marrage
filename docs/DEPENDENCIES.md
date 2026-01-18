# Dependencies Documentation

This document explains the purpose of each dependency in the project and categorizes them by usage (Frontend vs Backend).

## Project Architecture

This is a **Next.js full-stack application** using:
- **Frontend**: React components with Framer Motion animations
- **Backend**: Next.js API Routes with Clean Architecture
- **Database**: Prisma ORM
- **Validation**: Zod

---

## Production Dependencies

### Frontend Dependencies

#### `next` (v16.1.3)
- **Purpose**: React framework for frontend and API routes
- **Used in**: All pages, layouts, and API routes
- **Category**: Frontend + Backend (Next.js is full-stack)

#### `react` (v19.2.3)
- **Purpose**: UI library for building components
- **Used in**: All `.tsx` components
- **Category**: Frontend

#### `react-dom` (v19.2.3)
- **Purpose**: React renderer for web
- **Used in**: Next.js rendering
- **Category**: Frontend

#### `framer-motion` (v11.15.0)
- **Purpose**: Animation library for smooth UI transitions
- **Used in**: `app/proposal/page.tsx` for romantic animations
- **Category**: Frontend
- **Can remove if**: You don't need animations

---

### Backend Dependencies (API Routes)

#### `@prisma/client` (v6.2.0)
- **Purpose**: Type-safe database client
- **Used in**: 
  - `src/infrastructure/db/ProposalRepositoryPrisma.ts`
  - `app/api/proposal/route.ts`
- **Category**: Backend
- **Required for**: Database operations

#### `zod` (v3.24.1)
- **Purpose**: Runtime validation and type safety
- **Used in**: `app/api/proposal/route.ts` for request validation
- **Category**: Backend
- **Required for**: API input validation

---

## Development Dependencies

### Frontend Development

#### `@tailwindcss/postcss` (v4)
- **Purpose**: CSS processing for Tailwind
- **Used in**: Build process for styling
- **Category**: Frontend

#### `tailwindcss` (v4)
- **Purpose**: Utility-first CSS framework
- **Used in**: All component styling
- **Category**: Frontend

#### `eslint` (v9)
- **Purpose**: Code linting
- **Used in**: Code quality checks
- **Category**: Shared

#### `eslint-config-next` (v16.1.3)
- **Purpose**: Next.js-specific ESLint rules
- **Used in**: Linting configuration
- **Category**: Frontend

---

### Backend Development

#### `prisma` (v6.2.0)
- **Purpose**: Database toolkit and migration tool
- **Used in**: 
  - Schema management (`prisma/schema.prisma`)
  - Migrations
  - Prisma Studio
- **Category**: Backend
- **Required for**: Database development

---

### Shared Development Dependencies

#### `typescript` (v5)
- **Purpose**: Type-safe JavaScript
- **Used in**: All `.ts` and `.tsx` files
- **Category**: Shared (Frontend + Backend)

#### `@types/node` (v20)
- **Purpose**: TypeScript types for Node.js
- **Used in**: Server-side code, API routes
- **Category**: Shared

#### `@types/react` (v19)
- **Purpose**: TypeScript types for React
- **Used in**: React components
- **Category**: Frontend

#### `@types/react-dom` (v19)
- **Purpose**: TypeScript types for React DOM
- **Used in**: React rendering
- **Category**: Frontend

---

## Dependency Categories Summary

### Frontend Only
```json
{
  "react": "UI library",
  "react-dom": "React renderer",
  "framer-motion": "Animations",
  "tailwindcss": "Styling",
  "@tailwindcss/postcss": "CSS processing"
}
```

### Backend Only (API Routes)
```json
{
  "@prisma/client": "Database ORM",
  "prisma": "Database toolkit",
  "zod": "Validation"
}
```

### Full-Stack (Used by Both)
```json
{
  "next": "Framework for frontend + API routes",
  "typescript": "Type safety",
  "@types/node": "Node.js types"
}
```

---

## Installation Commands

### Install All Dependencies
```bash
npm install
```

### Install Frontend Only
```bash
npm install next react react-dom framer-motion
npm install -D tailwindcss @tailwindcss/postcss
```

### Install Backend Only
```bash
npm install @prisma/client zod
npm install -D prisma
```

### Install Shared/Dev Tools
```bash
npm install -D typescript @types/node @types/react @types/react-dom eslint eslint-config-next
```

---

## Removing Dependencies

### If You Don't Need Animations
```bash
npm uninstall framer-motion
```
Then remove Framer Motion imports from `app/proposal/page.tsx`

### If You Don't Need Database
```bash
npm uninstall @prisma/client prisma
```
Then remove Prisma-related code and use in-memory storage

### If You Don't Need Validation
```bash
npm uninstall zod
```
Then use manual validation in API routes

---

## Workflow Scripts

### Frontend Development
```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend Development
```bash
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio GUI
npm run db:push      # Push schema changes (dev only)
```

---

## Why This Structure?

This project uses **Next.js API Routes** instead of a separate backend server because:

1. ✅ **Simpler deployment** - Single app to deploy
2. ✅ **No CORS issues** - Same origin for frontend and API
3. ✅ **Shared types** - TypeScript types work across frontend/backend
4. ✅ **Vercel optimization** - Serverless functions auto-scale
5. ✅ **Clean architecture** - Backend logic is still separated in `/src`

The dependencies are mixed because Next.js is a full-stack framework, but the code architecture maintains clear separation between frontend (`/app` pages) and backend (`/src` clean architecture + `/app/api` routes).

---

## Future Considerations

If the project grows and you need to separate frontend and backend:

1. **Extract backend** to standalone Express/Fastify server
2. **Move** `/src` and `/prisma` to separate `backend/` directory
3. **Create** separate `package.json` for backend
4. **Configure** CORS and API proxy
5. **Deploy** separately (frontend to Vercel, backend to Railway/Render)

For now, the current structure is optimal for this use case.
