# Development Workflow Guide

This guide explains the development workflow for both frontend and backend development.

---

## Quick Start

### First Time Setup
```bash
# 1. Install all dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 3. Initialize database
npm run db:generate
npm run db:migrate

# 4. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Frontend Development Workflow

### Working on UI Components

1. **Start dev server**
   ```bash
   npm run dev
   ```

2. **Edit components** in `/app`
   - `app/page.tsx` - Home page
   - `app/proposal/page.tsx` - Proposal page
   - `app/layout.tsx` - Root layout

3. **Hot reload** - Changes appear instantly

4. **Styling**
   - Use Tailwind CSS classes
   - Edit `app/globals.css` for global styles

5. **Animations**
   - Framer Motion is configured
   - See examples in `app/proposal/page.tsx`

### Frontend-Only Dependencies
- `react`, `react-dom` - UI library
- `next` - Framework
- `framer-motion` - Animations
- `tailwindcss` - Styling

---

## Backend Development Workflow

### Working on Business Logic

1. **Edit domain entities** in `/src/core/entities`
   - Pure TypeScript classes
   - No framework dependencies
   - Business validation logic

2. **Edit use cases** in `/src/core/use-cases`
   - Business logic orchestration
   - Framework-agnostic

3. **Edit infrastructure** in `/src/infrastructure`
   - Database implementations
   - Email services
   - External integrations

### Working on API Routes

1. **Edit API routes** in `/app/api`
   - `app/api/proposal/route.ts`
   - Controllers that call use cases
   - Input validation with Zod

2. **Test API endpoints**
   ```bash
   # Using curl
   curl -X POST http://localhost:3000/api/proposal \
     -H "Content-Type: application/json" \
     -H "x-proposal-token: dev-secret-token-12345" \
     -d '{"answer": "YES", "message": "Test"}'
   
   # Get status
   curl http://localhost:3000/api/proposal
   ```

### Backend-Only Dependencies
- `@prisma/client` - Database ORM
- `prisma` - Database toolkit
- `zod` - Validation

---

## Database Workflow

### Schema Changes

1. **Edit schema**
   ```bash
   # Edit prisma/schema.prisma
   ```

2. **Create migration**
   ```bash
   npm run db:migrate
   # Enter migration name when prompted
   ```

3. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

### Database Management

```bash
# Open Prisma Studio (GUI)
npm run db:studio

# Push schema without migration (dev only)
npm run db:push

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Switching Databases

**SQLite (Development)**
```env
DATABASE_URL="file:./dev.db"
```

**PostgreSQL (Production)**
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

Then run:
```bash
npm run db:migrate
```

---

## Email Service Workflow

### Development (Mock Email)

By default, emails are logged to console:
```env
USE_MOCK_EMAIL="true"
```

Check terminal output when proposal is accepted.

### Production (Real Email)

1. **Choose email provider**
   - Resend (recommended)
   - SendGrid
   - AWS SES

2. **Install package**
   ```bash
   npm install resend
   ```

3. **Configure service**
   - Edit `src/infrastructure/email/EmailService.ts`
   - Uncomment `RealEmailService` implementation

4. **Set environment variables**
   ```env
   USE_MOCK_EMAIL="false"
   RESEND_API_KEY="re_xxxxx"
   EMAIL_FROM="noreply@yourdomain.com"
   EMAIL_TO="your-email@example.com"
   ```

---

## Testing Workflow

### Manual Testing

1. **Frontend**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Test proposal page interactions
   - Check responsive design

2. **Backend**
   - Use curl or Postman
   - Test API endpoints
   - Check database with Prisma Studio

### API Testing Examples

```bash
# Submit YES answer
curl -X POST http://localhost:3000/api/proposal \
  -H "Content-Type: application/json" \
  -H "x-proposal-token: dev-secret-token-12345" \
  -d '{
    "answer": "YES",
    "message": "I love you!",
    "recipientName": "My Love"
  }'

# Submit NO answer
curl -X POST http://localhost:3000/api/proposal \
  -H "Content-Type: application/json" \
  -H "x-proposal-token: dev-secret-token-12345" \
  -d '{
    "answer": "NO",
    "message": "Sorry..."
  }'

# Get current status
curl http://localhost:3000/api/proposal

# Invalid token (should fail)
curl -X POST http://localhost:3000/api/proposal \
  -H "Content-Type: application/json" \
  -H "x-proposal-token: wrong-token" \
  -d '{"answer": "YES"}'
```

---

## Build & Deployment Workflow

### Local Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Your message"
   git push
   ```

2. **Connect to Vercel**
   - Import repository at [vercel.com](https://vercel.com)
   - Auto-detects Next.js

3. **Set environment variables**
   - `DATABASE_URL` (PostgreSQL from Supabase)
   - `PROPOSAL_SECRET_TOKEN`
   - `EMAIL_FROM`, `EMAIL_TO`
   - `USE_MOCK_EMAIL="false"`
   - Email service API key

4. **Deploy**
   - Automatic on push to main branch

---

## Common Tasks

### Add New API Endpoint

1. Create route file: `app/api/your-endpoint/route.ts`
2. Define GET/POST handlers
3. Use existing use cases or create new ones
4. Add validation with Zod

### Add New Use Case

1. Create file: `src/core/use-cases/YourUseCase.ts`
2. Define input/output interfaces
3. Implement business logic
4. Use in API route

### Add New Database Model

1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Create repository interface in `/src/core/interfaces`
4. Implement in `/src/infrastructure/db`

### Customize UI

1. Edit component in `/app`
2. Update Tailwind classes
3. Add animations with Framer Motion
4. Test responsiveness

---

## Troubleshooting

### Database Issues

```bash
# Regenerate Prisma Client
npm run db:generate

# Reset database
npx prisma migrate reset

# Check database with Studio
npm run db:studio
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Type Errors

```bash
# Regenerate Prisma types
npm run db:generate

# Check TypeScript
npx tsc --noEmit
```

---

## Development Tips

1. **Keep domain logic pure** - No framework imports in `/src/core/entities`
2. **Use interfaces** - Depend on abstractions, not implementations
3. **Validate at boundaries** - API routes validate input, domain validates business rules
4. **Test use cases** - They're framework-agnostic and easy to test
5. **Check Prisma Studio** - Visual database inspection is helpful

---

## Project Structure Reminder

```
/app                    # Frontend (Next.js pages)
  /api                  # Backend (API routes - controllers)
  /proposal             # Proposal page
  page.tsx              # Home page

/src                    # Backend (Clean Architecture)
  /core                 # Domain layer (pure logic)
    /entities           # Domain entities
    /interfaces         # Contracts
    /use-cases          # Business logic
  /infrastructure       # Implementation layer
    /db                 # Database (Prisma)
    /email              # Email service

/prisma                 # Database
  schema.prisma         # Database schema
  /migrations           # Migration history
```

Frontend and backend are separated by **architecture**, not by `package.json`. This is intentional for Next.js full-stack apps.
