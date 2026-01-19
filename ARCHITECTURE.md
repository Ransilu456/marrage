# System Architecture

This project follows **Clean Architecture** (specifically a Hexagonal Architecture pattern) to ensure separation of concerns, testability, and maintainability.

## 🏗️ Architectural Layers

### 1. Domain Layer (`src/core`)
The heart of the application, independent of any external frameworks or databases.
-   **Entities (`src/core/entities`)**: Business objects (e.g., `User`, `Profile`, `Interest`). They contain the core business rules and logic.
-   **Use Cases (`src/core/use-cases`)**: Orchestrate the flow of data to and from the entities. They implement specific business actions (e.g., `VerifyIdentityDocumentUseCase`, `SearchProfilesUseCase`).
-   **Interfaces (`src/core/interfaces`)**: Define contracts for external services (e.g., `IUserRepository`, `IProfileRepository`).

### 2. Infrastructure Layer (`src/infrastructure`)
Contains concrete implementations of the interfaces defined in the domain layer.
-   **DB (`src/infrastructure/db`)**: Prisma-based repository implementations (e.g., `UserRepositoryPrisma`). This layer interacts directly with the database.
-   **Adapters**: (Future expansion) Adapters for email services, identity verification providers, etc.

### 3. Application/Library Layer (`src/lib`, `app/api`)
-   **Lib (`src/lib`)**: Shared setup for libraries like NextAuth, Prisma Client, and Pusher.
-   **API Routes (`app/api`)**: Small entry points that instantiate the necessary use cases and repositories to handle HTTP requests.

### 4. UI Layer (`app/components`, `app/(pages)`)
Next.js components and pages that render the user interface.

## 🔄 Data Flow

1.  **UI** triggers an action (e.g., clicking "Verify Profile").
2.  **API Route** receives the request and extracts necessary data.
3.  **API Route** instantiates a **Use Case** and its required **Repositories**.
4.  **Use Case** interacts with **Entities** to apply business rules.
5.  **Use Case** calls **Repository** methods to persist changes.
6.  **Repository** (Infrastructure) executes the database query via Prisma.
7.  Result flows back up to the **UI**.

## 🛡️ Trust & Verification Flow

The platform implements a multi-step trust layer:
1.  **User Registration**: Basic account creation.
2.  **Profile Completion**: Users provide detailed life and family info.
3.  **Document Upload**: Users upload ID documents (Passport, etc.).
4.  **Admin Review**: Moderators review documents and photos.
5.  **Verification Badge**: Once approved, users receive a "Verified" badge, increasing their trust score.

## 💬 Interaction Model

Interests and matches are handled through a strict proposal system:
-   Users can only chat after an **Interest** is **Accepted**.
-   Accepting an interest creates a **Match**.
-   A **Match** enables the real-time chat room.
