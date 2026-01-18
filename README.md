# 💍 Marriage Proposal Website

A romantic marriage proposal website built with **Clean Architecture** principles, featuring a beautiful UI and a robust backend.

## ✨ Features

- 🎯 **Clean Architecture**: Domain-driven design with clear separation of concerns
- 💝 **Romantic UI**: Beautiful, animated proposal page with emotional design
- 🔒 **Secure**: Token-based API protection
- 📧 **Email Notifications**: Automatic notifications when proposal is accepted
- 🗄️ **Prisma ORM**: Type-safe database operations with SQLite/PostgreSQL
- ⚡ **Next.js 16**: Modern React framework with App Router
- 📱 **Responsive**: Works perfectly on all devices

## 🏗️ Architecture

This project uses **Clean Architecture** with clear separation between frontend and backend:

**Frontend** (`/app`)
- Next.js pages and components
- React with Framer Motion animations
- Tailwind CSS styling

**Backend** (`/src` + `/app/api`)
- Clean Architecture layers (Domain, Use Cases, Infrastructure)
- Next.js API Routes as controllers
- Prisma ORM for database
- Zod for validation

> [!NOTE]
> **Dependencies**: While `package.json` contains both frontend and backend dependencies (Next.js is full-stack), the code architecture maintains clear separation. See [`docs/DEPENDENCIES.md`](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Web%20UI/Marrage/docs/DEPENDENCIES.md) for detailed dependency categorization.

### Project Structure

```
/src
  /core                          # Domain Layer (Framework-agnostic)
    /entities
      Proposal.ts                # Domain entity with business logic
    /use-cases
      SubmitAnswer.ts            # Submit proposal response
      GetProposalStatus.ts       # Retrieve proposal status
    /interfaces
      ProposalRepository.ts      # Repository interface
      EmailService.ts            # Email service interface
  
  /infrastructure                # Infrastructure Layer
    /db
      prismaClient.ts            # Prisma client singleton
      ProposalRepositoryPrisma.ts # Prisma implementation
    /email
      EmailService.ts            # Email service implementations

/app                             # Next.js App Router
  /api/proposal
    route.ts                     # API endpoints (Controllers)
  /proposal
    page.tsx                     # Proposal UI page
  page.tsx                       # Home page
  layout.tsx                     # Root layout

/prisma
  schema.prisma                  # Database schema
```

## 📚 Documentation

- **[README.md](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Web%20UI/Marrage/README.md)** - This file (setup and overview)
- **[docs/API.md](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Web%20UI/Marrage/docs/API.md)** - API endpoint documentation
- **[docs/DEPENDENCIES.md](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Web%20UI/Marrage/docs/DEPENDENCIES.md)** - Dependency categorization and explanation
- **[docs/WORKFLOW.md](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Web%20UI/Marrage/docs/WORKFLOW.md)** - Development workflow for frontend and backend

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ installed
- npm, yarn, or pnpm

### Installation

1. **Clone and install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Copy `.env.example` to `.env` and configure:

```bash
# Database (SQLite for development)
DATABASE_URL="file:./dev.db"

# Security token (change this!)
PROPOSAL_SECRET_TOKEN="your-secret-token-here"

# Email configuration
EMAIL_FROM="noreply@proposal.com"
EMAIL_TO="your-email@example.com"
USE_MOCK_EMAIL="true"
```

3. **Initialize the database**

```bash
npm run db:generate
npm run db:migrate
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📡 API Documentation

### POST /api/proposal

Submit a proposal answer.

**Headers:**
```json
{
  "Content-Type": "application/json",
  "x-proposal-token": "your-secret-token"
}
```

**Request Body:**
```json
{
  "answer": "YES",
  "message": "I love you so much! Of course I'll marry you!",
  "recipientName": "My Love"
}
```

**Response (200):**
```json
{
  "success": true,
  "proposal": {
    "id": "uuid",
    "recipientName": "My Love",
    "answer": "YES",
    "message": "I love you so much!",
    "createdAt": "2026-01-17T...",
    "updatedAt": "2026-01-17T..."
  },
  "emailSent": true
}
```

**Error Responses:**
- `401`: Unauthorized (invalid token)
- `400`: Validation error
- `500`: Server error

### GET /api/proposal

Get current proposal status.

**Query Parameters:**
- `id` (optional): Specific proposal ID

**Response (200):**
```json
{
  "success": true,
  "proposal": {
    "id": "uuid",
    "recipientName": "My Love",
    "answer": "PENDING",
    "createdAt": "2026-01-17T..."
  }
}
```

**Error Responses:**
- `404`: No proposal found
- `500`: Server error

## 🗄️ Database Management

### Available Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create and run migrations
npm run db:migrate

# Open Prisma Studio (GUI)
npm run db:studio

# Push schema without migrations (development)
npm run db:push
```

### Switch to PostgreSQL (Production)

1. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env` with PostgreSQL connection string:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

3. Run migrations:

```bash
npm run db:migrate
```

## 📧 Email Configuration

### Development (Mock Email)

By default, emails are logged to the console. Perfect for testing!

### Production (Real Email)

1. Choose an email service:
   - [Resend](https://resend.com) (Recommended)
   - SendGrid
   - AWS SES
   - Nodemailer with SMTP

2. Install the package (example with Resend):

```bash
npm install resend
```

3. Update `src/infrastructure/email/EmailService.ts`:

Uncomment and configure the `RealEmailService` implementation.

4. Set environment variables:

```bash
USE_MOCK_EMAIL="false"
RESEND_API_KEY="re_xxxxxxxxxxxxx"
```

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Connect to Vercel**

- Go to [vercel.com](https://vercel.com)
- Import your repository
- Vercel will auto-detect Next.js

3. **Set Environment Variables**

In Vercel dashboard, add:
- `DATABASE_URL` (PostgreSQL from Supabase/Neon)
- `PROPOSAL_SECRET_TOKEN`
- `EMAIL_FROM`
- `EMAIL_TO`
- `USE_MOCK_EMAIL="false"`
- Email service API key (e.g., `RESEND_API_KEY`)

4. **Deploy!**

Vercel will automatically build and deploy.

### Using Supabase PostgreSQL

1. Create a project at [supabase.com](https://supabase.com)
2. Get the connection string from Settings → Database
3. Add to Vercel environment variables
4. Run migrations:

```bash
npm run db:migrate
```

## 🔒 Security Considerations

> [!WARNING]
> **Important Security Notes**

1. **Change the default token**: Never use the default `PROPOSAL_SECRET_TOKEN` in production
2. **HTTPS only**: Always use HTTPS in production
3. **Environment variables**: Never commit `.env` to version control
4. **Rate limiting**: Consider adding rate limiting for production
5. **Private deployment**: This is designed for a private, personal use case

## 🛠️ Development

### Project Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

### Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Clean Architecture
- **Database**: Prisma ORM, SQLite (dev), PostgreSQL (prod)
- **Validation**: Zod
- **Deployment**: Vercel-ready

> [!TIP]
> See [`docs/DEPENDENCIES.md`](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Web%20UI/Marrage/docs/DEPENDENCIES.md) for detailed explanation of each dependency and how to manage frontend vs backend packages.

## 📝 Clean Architecture Benefits

1. **Testability**: Business logic is framework-agnostic
2. **Maintainability**: Clear separation of concerns
3. **Flexibility**: Easy to swap implementations (database, email service)
4. **Scalability**: Well-organized codebase that grows cleanly

## 🎨 Customization

### Change Recipient Name

Edit `app/proposal/page.tsx`:

```typescript
recipientName: 'Your Partner Name'
```

### Customize Colors

Edit Tailwind classes in:
- `app/proposal/page.tsx`
- `app/page.tsx`

### Add More Features

The clean architecture makes it easy to add:
- Photo gallery
- Custom messages
- Multiple proposals
- Analytics

## 📄 License

This is a personal project template. Feel free to use and customize for your own romantic purposes! 💕

## 🙏 Acknowledgments

Built with love using modern web technologies and clean architecture principles.

---

**Made with ❤️ for the most special person in the world**
