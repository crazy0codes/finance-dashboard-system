## Overview

The Finance Dashboard System is a Node.js backend application designed to support the storage and management of financial entries, user roles, permissions, and summary-level analytics. It allows different users to interact with financial records based on their assigned roles.

## Tech Stack

- **Runtime:** Node.js
    
- **Framework:** Express.js (`^5.2.1`)
    
- **Database:** PostgreSQL
    
- **ORM:** Prisma (`^7.6.0`)
    
- **Authentication:** JWT (`jsonwebtoken`)
    
- **Password Hashing:** bcrypt (`^6.0.0`)

---

## Roles and Permissions (RBAC)

The system implements Role-Based Access Control (RBAC) with the following roles:

- **VIEWER (Default):** Can view records. Cannot create, update, or delete records. Cannot access dashboard analytics.
    
- **ANALYST:** Can view records and access dashboard analytics. Cannot modify records or manage users.
    
- **ADMIN:** Full access. Can manage users (change roles/status, delete), manage all records (create, update, delete), and view dashboard analytics.

---

## Design Decisions & Assumptions

- **Architecture**
This project follows MVC architecture — routes handle incoming requests, controllers manage request/response, and services contain all business logic. This separation makes the code easier to maintain and reason about.

- **Error Handling**
Instead of throwing plain `new Error()` everywhere and writing repetitive status code checks in every controller, I created a custom `AppError` class that carries both a message and a status code. Controllers just check `error.isOperational` to decide whether to show the error to the client or hide it behind a generic 500. This keeps sensitive internal errors away from the client while still returning meaningful messages for expected errors like "User not found" or "Email already exists".

- **Validation**
I wrote simple custom validation middleware instead of using libraries like Zod or Joi. It checks field presence, types, and enum values manually. It's more verbose but easier to understand and doesn't add unnecessary dependencies for a project of this size.

- **Multiple Admins**
The system allows multiple admins by design. There's no real-world rule that limits a company to one admin. An existing admin can register or promote other users to ADMIN role. If needed, this can easily be restricted to a single admin by adding a check in the register service.

- **Enums over Tables**
Instead of creating separate tables for categories, roles, statuses and record types, I used PostgreSQL enums via Prisma. The values are fixed and well-defined, so a separate table would add unnecessary complexity without any benefit.

- **Soft Delete**
Records are soft deleted by setting a `deletedAt` timestamp instead of removing the row. This preserves financial history which is important in any finance system. Users are hard deleted — when a user is deleted, their records cascade delete automatically.

**What I'd improve with more time**
- Add pagination to record listing
- Add rate limiting to auth endpoints  
- Add refresh token support
- Write unit tests for the service layer
- Restrict system to single super-admin with ability to promote others

---

## Database Schema

![Finance Dashboard](docs/finance.svg)

### Models

#### 1. User

- `id`: Integer (Primary Key)
    
- `email`: String (Unique)
    
- `password`: String (Hashed)
    
- `role`: Enum `Role` (VIEWER, ANALYST, ADMIN) - Default: VIEWER
    
- `status`: Enum `Status` (ACTIVE, INACTIVE) - Default: ACTIVE
    
- `createdAt`: DateTime

#### 2. Record

- `id`: Integer (Primary Key)
    
- `amount`: Decimal
    
- `type`: Enum `RecordType` (INCOME, EXPENSE)
    
- `category`: Enum `Category` (SHOPPING, FOOD, TRAVEL, EMI, OTHER)
    
- `date`: DateTime
    
- `notes`: String (Optional)
    
- `userId`: Integer (Foreign Key referencing User, cascades on delete)
    
- `createdAt`: DateTime
    
- `updatedAt`: DateTime
    
- `deletedAt`: DateTime (Soft delete)


---

## API Endpoints

### Authentication Routes

Base Path: `/api/auth`

- **POST `/register`**
    
    - **Description:** Registers a new user.
        
    - **Body:** `{ "email": "user@example.com", "password": "password123", "role": "VIEWER" }` (role is optional)
        
    - **Response:** `201 Created` with user details (excluding password).
        
- **POST `/login`**
    
    - **Description:** Authenticates a user and returns a JWT.
        
    - **Body:** `{ "email": "user@example.com", "password": "password123" }`
        
    - **Response:** `200 OK` with `{ "token": "jwt_token_string" }`

### User Routes

Base Path: `/api/users`

_(All routes require Authentication and `ADMIN` role)_

- **GET `/`**
    
    - **Description:** Retrieves all users.
        
    - **Response:** `200 OK` with list of users.
    
- **PATCH `/:id/role`**
    
    - **Description:** Updates a user's role.
        
    - **Body:** `{ "role": "ADMIN" }`
        
    - **Response:** `200 OK` with updated user.
    
- **PATCH `/:id/status`**
    
    - **Description:** Updates a user's status (e.g., ACTIVE, INACTIVE).
        
    - **Body:** `{ "status": "INACTIVE" }`
        
    - **Response:** `200 OK` with updated user.
    
- **DELETE `/:id`**
    
    - **Description:** Deletes a user.
        
    - **Response:** `200 OK`
    

### Record Routes

Base Path: `/api/records`

_(All routes require Authentication)_

- **GET `/`**
    
    - **Description:** Retrieves records (excluding soft-deleted ones).
        
    - **Permissions:** VIEWER, ANALYST, ADMIN
        
    - **Query Params (Optional):** `type`, `category`, `startDate`, `endDate`
        
    - **Response:** `200 OK` with list of records.
        
- **POST `/`**
    
    - **Description:** Creates a new financial record.
        
    - **Permissions:** ADMIN
        
    - **Body:** `{ "amount": 1000, "type": "INCOME", "category": "OTHER", "date": "2023-10-01T00:00:00Z", "notes": "Salary" }`
        
    - **Response:** `201 Created`
        
- **PATCH `/:id`**
    
    - **Description:** Updates an existing record.
        
    - **Permissions:** ADMIN
        
    - **Body:** Fields to update (e.g., `{ "amount": 1500 }`).
        
    - **Response:** `200 OK`
        
- **DELETE `/:id`**
    
    - **Description:** Soft-deletes a record.
        
    - **Permissions:** ADMIN
        
    - **Response:** `200 OK`
        

### Dashboard Routes

Base Path: `/api/dashboard`

_(All routes require Authentication and `ANALYST` or `ADMIN` role)_

- **GET `/summary`**
    
    - **Description:** Returns total income, total expense, and net balance.
    
- **GET `/categories`**
    
    - **Description:** Returns total amount grouped by category.
    
- **GET `/recent`**
    
    - **Description:** Returns the 10 most recent records.
        
    - **Query Params (Optional):** `limit`
    
- **GET `/trends`**
    
    - **Description:** Returns monthly income, expense, and net trends.
        
    - **Query Params (Optional):** `startDate`, `endDate`
    

---

## Setup & Installation

1. **Clone the repository** and install dependencies:
    
    Bash

    ```
   npm install
    ```

2. **Environment Variables:** Create a `.env` file in the root directory:
    
    Code snippet
    
    ```
    PORT=3000
    DATABASE_URL="postgresql://user:password@localhost:5432/finance_db"
    JWT_SECRET="your_super_secret_jwt_key"
    ```
    
3. **Database Setup:** Run Prisma migrations to set up the database schema:
    
    Bash
    
    ```
    npx prisma migrate dev
    ```
    
4. **Start the Server:**
    
    - Development mode (watch): `npm run dev`
        
    - Production mode: `npm start`
    
