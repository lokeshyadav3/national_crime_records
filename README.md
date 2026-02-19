# National Crime Records Management System

A full-stack **First Information Report (FIR) and Crime Records Management System** built for Nepal Police. The application manages police stations, officers, cases (FIRs), persons, evidence, and generates printable FIR PDF reports — all through a role-based, authenticated web interface.

Built with **Next.js 16**, **PostgreSQL**, **TypeScript**, and **Tailwind CSS**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [API Reference](#api-reference)
- [Pages & UI](#pages--ui)
- [Components](#components)
- [Library Modules](#library-modules)
- [FIR Report PDF Generation](#fir-report-pdf-generation)
- [File Uploads](#file-uploads)
- [Scripts & Database Utilities](#scripts--database-utilities)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)

---

## Features

- **Role-Based Access Control** — Admin, StationAdmin, and Officer roles with granular permissions
- **Case (FIR) Management** — Register, track, and update First Information Reports
- **Person Management** — Manage complainants, accused, suspects, witnesses, and victims
- **Evidence Management** — Upload and track physical/digital evidence with media preview (images, video, audio, documents)
- **Officer Management** — Manage officer profiles with photos, signatures, and station assignments
- **Station Management** — Manage police stations across Nepal with district/municipality data
- **FIR PDF Generation** — Generate printable, formatted FIR reports with person details, evidence, and signature blocks
- **Case Timeline Tracking** — Full history of status changes and actions on each case
- **Supplementary Statements** — Add additional statements from case-linked persons
- **Interactive Dashboard** — Role-specific dashboards with crime statistics, pie charts, and Nepal district map
- **Email Notifications** — Automated credential and password reset emails via Gmail SMTP
- **Nepal Location Data** — Cascading province → district → municipality selectors

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL (via `pg`) |
| Styling | Tailwind CSS 4 |
| Authentication | `iron-session` (encrypted cookie sessions) |
| Password Hashing | `bcryptjs` |
| PDF Generation | `jsPDF` + `jspdf-autotable` |
| Charts | `recharts` |
| Maps | `leaflet` + `react-leaflet` |
| Email | `nodemailer` (Gmail SMTP) |
| GeoJSON | `nepal-geojson` |
| Runtime | Node.js |

---

## Project Structure

```
national_crime_records/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, global CSS)
│   ├── page.tsx                  # Root page (redirects to /dashboard)
│   ├── globals.css               # Global styles
│   ├── api/                      # API route handlers
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/route.ts    # POST: Login with credentials
│   │   │   ├── logout/route.ts   # POST: Destroy session
│   │   │   ├── me/route.ts       # GET: Current user info
│   │   │   ├── reset-admin/route.ts   # GET: Reset admin password
│   │   │   └── reset-all/route.ts     # GET: Reset all passwords (dev)
│   │   ├── cases/                # Case/FIR endpoints
│   │   │   ├── route.ts          # GET: List cases | POST: Create case
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET: Case detail | PUT: Update case
│   │   │       ├── persons/      # GET/POST: Case-person links & statements
│   │   │       ├── report/route.ts    # GET: Full case report data for PDF
│   │   │       ├── supplementary-statements/route.ts  # GET/POST: Supplementary statements
│   │   │       └── tracking/route.ts  # GET: Case timeline/tracking
│   │   ├── evidence/             # Evidence endpoints
│   │   │   ├── route.ts          # GET: List | POST: Create evidence
│   │   │   └── [id]/route.ts     # GET | PUT | DELETE: Single evidence
│   │   ├── officers/             # Officer endpoints
│   │   │   ├── route.ts          # GET: List | POST: Create officer
│   │   │   └── [id]/route.ts     # GET | PUT | DELETE: Single officer
│   │   ├── persons/              # Person endpoints
│   │   │   ├── route.ts          # GET: List | POST: Create person
│   │   │   ├── [id]/route.ts     # GET | PUT | DELETE: Single person
│   │   │   └── search/route.ts   # GET: Enhanced person search
│   │   ├── stations/             # Police station endpoints
│   │   │   ├── route.ts          # GET: List | POST: Create station
│   │   │   └── [id]/route.ts     # GET | PUT | DELETE: Single station
│   │   ├── reports/
│   │   │   └── stats/route.ts    # GET: Dashboard statistics
│   │   ├── upload/route.ts       # POST: File upload (images, video, audio, docs)
│   │   ├── users/                # User management
│   │   │   ├── route.ts          # GET: List | POST: Create user
│   │   │   └── [id]/route.ts     # PUT | DELETE: Update/delete user
│   │   └── geojson/
│   │       └── nepal/route.ts    # GET: Nepal districts GeoJSON data
│   ├── login/page.tsx            # Login form
│   └── (dashboard)/              # Route group — shared layout for all authenticated pages
│       ├── layout.tsx            # Shared auth check + UserProvider + Navbar (runs once)
│       ├── dashboard/page.tsx    # Role-specific dashboard
│       ├── cases/
│       │   ├── page.tsx          # Cases list (search/filter)
│       │   ├── [id]/page.tsx     # Case detail (tabbed: People, Evidence, Timeline)
│       │   └── new/page.tsx      # New FIR registration form
│       ├── officers/
│       │   ├── page.tsx          # Officers list
│       │   ├── [id]/page.tsx     # Officer detail
│       │   ├── [id]/edit/page.tsx # Edit officer
│       │   └── new/page.tsx      # New officer form
│       ├── stations/
│       │   ├── page.tsx          # Stations list
│       │   ├── [id]/page.tsx     # Station detail
│       │   ├── [id]/edit/page.tsx # Edit station
│       │   └── new/page.tsx      # New station form
│       ├── persons/
│       │   ├── page.tsx          # Persons list (cascading search)
│       │   ├── [id]/page.tsx     # Person detail view (profile, associated cases)
│       │   ├── [id]/edit/page.tsx # Edit person
│       │   └── new/page.tsx      # New person form
│       ├── evidence/
│       │   └── new/page.tsx      # New evidence upload form
│       └── users/
│           ├── page.tsx          # Users management
│           └── new/page.tsx      # New user form
├── components/                   # Reusable UI components
│   ├── DashboardLayout.tsx       # Legacy wrapper (kept for reference; replaced by route group layout)
│   ├── Navbar.tsx                # Navigation bar with role-based links
│   ├── SignaturePad.tsx          # Signature capture component
│   ├── cases/
│   │   ├── CaseEvidence.tsx      # Evidence table with preview/download
│   │   ├── CasePeople.tsx        # People table with roles & statements
│   │   ├── CaseTimeline.tsx      # Timeline/tracking history table
│   │   └── forms/
│   │       ├── AddEvidenceForm.tsx    # Add evidence modal
│   │       ├── AddPersonForm.tsx      # Link person to case modal
│   │       └── AddStatementForm.tsx   # Add supplementary statement modal
│   └── dashboards/
│       ├── AdminDashboard.tsx         # System-wide admin dashboard
│       ├── StationAdminDashboard.tsx  # Station-scoped dashboard
│       ├── OfficerDashboard.tsx       # Officer-scoped dashboard
│       ├── CrimeTypePieChart.tsx      # Crime type distribution pie chart
│       └── NepalDistrictMap.tsx       # Interactive Nepal map (Leaflet)
├── lib/                          # Shared utility modules
│   ├── auth.ts                   # Session management, password hashing
│   ├── db.ts                     # PostgreSQL connection pool & query helpers
│   ├── email.ts                  # Email sending (credentials, password reset)
│   ├── generateFIRReport.ts      # FIR PDF report generator
│   ├── permissions.ts            # Role-based permission definitions
│   ├── types.ts                  # TypeScript type definitions
│   └── UserContext.tsx           # React context for current user (accepts initialUser from server)
├── database/                     # SQL files
│   ├── schema.sql                # Table definitions
│   ├── seed_complete.sql         # Full seed data
│   ├── seed_officers.sql         # Officer seed data
│   ├── seed_teku_cases.sql       # Teku station sample cases
│   ├── seed_users_persons.sql    # User & person seed data
│   └── reset_database.sql        # Drop & recreate all tables
├── scripts/                      # Utility scripts
│   ├── generate-hash.js          # Generate bcrypt hash
│   ├── generate-admin123-hash.js # Generate hash for 'admin123'
│   ├── generate-password-hash.js # Generate password hash
│   ├── verify-password.js        # Verify a password against hash
│   └── init-admin.sql            # SQL to initialize admin user
├── public/
│   ├── nepal_location.json       # Nepal province/district/municipality data
│   ├── nepal-districts.geojson   # Nepal districts GeoJSON for map
│   └── uploads/                  # Uploaded files
│       ├── officers/             # Officer photos & signatures
│       ├── signatures/           # Signature images
│       ├── stations/             # Station photos
│       └── evidence/             # Evidence files
├── middleware.ts                  # Auth & role-based route protection
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── eslint.config.mjs
```

---

## Database Schema

The system uses **9 PostgreSQL tables**:

### Entity Relationship

```
police_stations ─┬─< officers
                 │
                 ├─< cases ──┬─< case_persons ─< supplementary_statements
                 │            │
                 │            ├─< evidence
                 │            │
                 │            └─< fir_track_records
                 │
                 └─< users
```

### Tables

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `police_stations` | Police stations across Nepal | `station_code`, `station_name`, `district`, `municipality`, `photo`, `incharge_officer_id` |
| `officers` | Police officers | `badge_number`, `rank`, `station_id`, `photo`, `signature`, address fields |
| `persons` | People involved in cases | `first_name`, `last_name`, `national_id`, `citizenship`, `photo`, `signature` |
| `cases` | FIR/Case records | `fir_no`, `crime_type`, `crime_section`, `incident_date_time`, `case_status`, `case_priority`, `station_id`, `officer_id` |
| `case_persons` | Links persons to cases | `case_id`, `person_id`, `role` (Complainant/Accused/Suspect/Witness/Victim), `is_primary`, `statement` |
| `evidence` | Evidence items per case | `evidence_code`, `evidence_type`, `file_path`, `status`, `collected_by` |
| `fir_track_records` | Case timeline/audit log | `action_type`, `old_status`, `new_status`, `action_description`, `performed_by_user_id` |
| `users` | System login accounts | `username`, `password_hash`, `role`, `officer_id`, `station_id` |
| `supplementary_statements` | Additional statements after initial | `case_person_id`, `statement`, `recorded_by_user_id`, `remarks` |

### Case Statuses

`Registered` → `Under Investigation` → `Charge Sheet Filed` → `Closed` | `Pending`

### Case Priorities

`Low` | `Medium` | `High` | `Critical`

### Person Roles

`Complainant` | `Accused` | `Suspect` | `Witness` | `Victim`

### Evidence Statuses

`Collected` | `Analyzed` | `Stored` | `Disposed`

---

## Authentication & Authorization

### Session Management

- Uses **`iron-session`** for encrypted cookie-based sessions
- Session cookie name: `fir_session` (configurable via `SESSION_NAME`)
- Session TTL: 24 hours (configurable via `SESSION_TTL`)
- Passwords hashed with **`bcryptjs`** (10 salt rounds)

### User Roles

| Role | Access Level |
|------|-------------|
| **Admin** | Full system access — manage stations, officers, users, cases, persons, evidence, reports |
| **StationAdmin** | Manage officers and cases within their assigned station. Can view their own station. Cannot create stations or manage users |
| **Officer** | Create/update cases, persons, evidence within their station. Cannot access station/user/officer management pages |

### Middleware Protection

The middleware ([middleware.ts](middleware.ts)) runs on every request and:

1. Allows public paths (`/login`, `/api/auth/login`) without authentication
2. Redirects unauthenticated users to `/login`
3. Returns `401` for unauthenticated API requests
4. Enforces role-based route restrictions (e.g., Officers cannot access `/stations`, `/users`, `/officers`)
5. Returns `403` for unauthorized role access

### Permission System

Defined in [lib/permissions.ts](lib/permissions.ts) with granular permissions like:

```
users.create, users.read, users.update, users.delete
stations.create, stations.read, stations.update, stations.delete
officers.create, officers.read, officers.update, officers.delete
cases.create, cases.read, cases.update, cases.delete
persons.create, persons.read, persons.update, persons.delete
evidence.create, evidence.read, evidence.update, evidence.delete
reports.generate
```

> **Note:** Admin role cannot directly create or edit FIR cases — this is restricted to StationAdmin and Officer roles.

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with `username` and `password` |
| POST | `/api/auth/logout` | Destroy session and logout |
| GET | `/api/auth/me` | Get current authenticated user |
| GET | `/api/auth/reset-admin` | Reset admin account to `admin123` (dev utility) |
| GET | `/api/auth/reset-all` | Reset all user passwords to `admin123` (dev utility) |

### Cases (FIR)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cases` | List cases (supports `?search=`, `?status=`, `?station_id=`) |
| POST | `/api/cases` | Create a new FIR case |
| GET | `/api/cases/:id` | Get case details with station info |
| PUT | `/api/cases/:id` | Update case (status, details, priority) |
| GET | `/api/cases/:id/persons` | List persons linked to a case |
| POST | `/api/cases/:id/persons` | Link a person to a case with role/statement |
| GET | `/api/cases/:id/report` | Get full report data for PDF generation |
| GET | `/api/cases/:id/tracking` | Get case timeline/tracking history |
| GET | `/api/cases/:id/supplementary-statements` | List supplementary statements |
| POST | `/api/cases/:id/supplementary-statements` | Add a supplementary statement |

### Evidence

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/evidence` | List evidence (supports `?case_id=`, `?search=`) |
| POST | `/api/evidence` | Create evidence record |
| GET | `/api/evidence/:id` | Get single evidence item |
| PUT | `/api/evidence/:id` | Update evidence |
| DELETE | `/api/evidence/:id` | Delete evidence |

### Officers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/officers` | List officers (supports `?search=`, `?station_id=`, `?rank=`, `?status=`) |
| POST | `/api/officers` | Create officer |
| GET | `/api/officers/:id` | Get officer details |
| PUT | `/api/officers/:id` | Update officer |
| DELETE | `/api/officers/:id` | Delete officer |

### Persons

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/persons` | List persons (supports `?search=`) |
| POST | `/api/persons` | Create person record |
| GET | `/api/persons/:id` | Get person details |
| PUT | `/api/persons/:id` | Update person |
| DELETE | `/api/persons/:id` | Delete person |
| GET | `/api/persons/search?q=` | Enhanced search (name, national ID) |

### Stations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stations` | List stations (supports `?search=`) |
| POST | `/api/stations` | Create station |
| GET | `/api/stations/:id` | Get station with incharge officer info |
| PUT | `/api/stations/:id` | Update station |
| DELETE | `/api/stations/:id` | Delete station |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users with station/officer joins |
| POST | `/api/users` | Create user (auto-generates password, sends email) |
| PUT | `/api/users/:id` | Update user (role, station, password) |
| DELETE | `/api/users/:id` | Delete user |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/stats` | Dashboard statistics (scoped by role/station) |
| POST | `/api/upload` | File upload (categories: `stations`, `officers`, `persons`, `evidence`) |
| GET | `/api/geojson/nepal` | Nepal districts GeoJSON data |

---

## Pages & UI

### Page Flow

```
/login ──→ /dashboard ──→ /cases     ──→ /cases/:id (detail)
                          │               /cases/new (register FIR)
                          ├── /officers ──→ /officers/:id
                          │                 /officers/:id/edit
                          │                 /officers/new
                          ├── /stations ──→ /stations/:id
                          │                 /stations/:id/edit
                          │                 /stations/new
                          ├── /persons  ──→ /persons/:id (detail)
                          │                 /persons/:id/edit
                          │                 /persons/new
                          ├── /evidence ──→ /evidence/new
                          └── /users    ──→ /users/new
```

> **Note:** All authenticated routes (`/dashboard`, `/cases`, `/officers`, `/stations`, `/persons`, `/evidence`, `/users`) share a single `(dashboard)` route group layout. This means the Navbar, auth check, and `UserProvider` mount **once** and persist across all navigations — no re-rendering or redundant API calls when switching between sections.

### Page Descriptions

| Route | Description |
|-------|-------------|
| `/login` | Username/password login form. Redirects to `/dashboard` on success |
| `/dashboard` | Renders role-specific dashboard (Admin / StationAdmin / Officer) with statistics, charts, and quick actions |
| `/cases` | Searchable, filterable list of FIR cases. Click to view details |
| `/cases/new` | Multi-step new FIR form — incident details, persons, evidence |
| `/cases/:id` | Tabbed case detail view — **Details**, **People**, **Evidence**, **Timeline**. Includes FIR PDF download |
| `/officers` | Officers list with search/filter by district, station, rank |
| `/officers/:id` | Officer profile with photo, details, and assigned cases |
| `/officers/:id/edit` | Edit officer details |
| `/officers/new` | Create new officer with Nepal location selectors |
| `/stations` | Police stations list with search/filter |
| `/stations/:id` | Station detail — info, location, officers, and cases |
| `/stations/:id/edit` | Edit station details |
| `/stations/new` | Create new station with province → district → municipality cascade |
| `/persons` | Searchable persons list with cascading search |
| `/persons/:id` | Person detail view — personal info, contact/address, photo/signature, quick stats, and associated cases table |
| `/persons/:id/edit` | Edit person details (StationAdmin/Officer only) |
| `/persons/new` | Create new person record |
| `/evidence/new` | Upload evidence with file preview, case association |
| `/users` | User management — list, delete, reset passwords |
| `/users/new` | Create new system user with role and station assignment |

---

## Components

### Layout Components

| Component | Purpose |
|-----------|---------|
| `(dashboard)/layout.tsx` | **Route group layout** — single shared server component for all authenticated pages. Validates authentication via `getCurrentUser()`, wraps children in `UserProvider` (with `initialUser` from server) + `Navbar`. Redirects to `/login` if not authenticated. Mounts once and persists across all navigations, preventing redundant auth checks |
| `DashboardLayout` | Legacy server component (kept for reference). Previously used per-section; now replaced by the route group layout |
| `Navbar` | Client-side navigation bar with role-based link visibility, active route highlighting, mobile-responsive menu, and logout |

### Case Detail Components

| Component | Purpose |
|-----------|---------|
| `CaseEvidence` | Renders evidence items in a table. Supports inline preview (images, video, audio, documents) and download buttons |
| `CasePeople` | Renders case-linked persons in a table with role badges, primary indicator, photos, signatures, initial statements, and supplementary statements |
| `CaseTimeline` | Renders case tracking history in a table showing actions, status changes, descriptions, and performing officer |

### Case Form Components

| Component | Purpose |
|-----------|---------|
| `AddEvidenceForm` | Modal form for adding evidence — file upload with media type preview, evidence type/description fields |
| `AddPersonForm` | Modal form for linking persons — person search, role selection, initial statement |
| `AddStatementForm` | Modal form for supplementary statements — select case person, enter statement with remarks |

### Dashboard Components

| Component | Purpose |
|-----------|---------|
| `AdminDashboard` | System-wide statistics — total cases, officers, stations, status breakdown. Includes `CrimeTypePieChart` |
| `StationAdminDashboard` | Station-scoped statistics with crime distribution chart and `NepalDistrictMap` |
| `OfficerDashboard` | Officer-scoped statistics with `NepalDistrictMap` |
| `CrimeTypePieChart` | `recharts` PieChart showing crime type distribution |
| `NepalDistrictMap` | Interactive `leaflet` map rendering Nepal districts from GeoJSON data |

### Utility Components

| Component | Purpose |
|-----------|---------|
| `SignaturePad` | Canvas-based signature capture component for person/officer forms |

---

## Library Modules

| Module | File | Purpose |
|--------|------|---------|
| **Auth** | [lib/auth.ts](lib/auth.ts) | Session management (`getSession`, `getCurrentUser`, `isAuthenticated`), password hashing/verification (`hashPassword`, `verifyPassword`), role checking (`hasRole`, `canAccessStation`) |
| **Database** | [lib/db.ts](lib/db.ts) | PostgreSQL connection pool using `pg`. Provides `executeQuery()` and `queryOne()` helpers. Auto-converts `?` placeholders to PostgreSQL `$1, $2` format |
| **Email** | [lib/email.ts](lib/email.ts) | Sends email via Gmail SMTP using `nodemailer`. Functions: `sendCredentialsEmail()` (new account), `sendPasswordResetEmail()` (password reset) |
| **FIR Report** | [lib/generateFIRReport.ts](lib/generateFIRReport.ts) | Generates multi-page FIR PDF using `jsPDF` + `jspdf-autotable`. Includes 10 numbered sections with person photos, evidence listings, and 3-column signature block |
| **Permissions** | [lib/permissions.ts](lib/permissions.ts) | Defines `rolePermissions` matrix for Admin/StationAdmin/Officer roles. Provides `hasPermission()` and `getRolePermissions()` |
| **Types** | [lib/types.ts](lib/types.ts) | TypeScript interfaces and type definitions for all entities (User, Officer, Case, Person, Evidence, etc.) |
| **User Context** | [lib/UserContext.tsx](lib/UserContext.tsx) | React context provider (`UserProvider`) and hook (`useUser()`). Accepts an optional `initialUser` prop from the server layout to avoid redundant client-side `/api/auth/me` fetches. Falls back to API call if no initial user is provided |

---

## FIR Report PDF Generation

The FIR PDF report ([lib/generateFIRReport.ts](lib/generateFIRReport.ts)) generates a comprehensive, printable document with:

### Sections

1. **Header** — FIR number, station name, date
2. **Case Information** — Crime type, section, priority, status
3. **Incident Details** — Date/time, location, district, description
4. **Complainant Details** — Name, contact, address, photo, statement
5. **Accused/Suspect Details** — Name, details, photo
6. **Witness Information** — Names, statements
7. **Victim Information** — Names, details
8. **Evidence** — Evidence list with type, description, collection info
9. **Case Timeline** — Tracking/action history
10. **Supplementary Statements** — Additional recorded statements

### Footer

- 3-column signature block: Complainant, Investigating Officer, Station In-Charge
- Loads officer photos and signatures embedded in the PDF

### Usage

Triggered from the case detail page (`/cases/:id`) via a "Generate FIR Report" button. The PDF is generated client-side and downloaded directly.

---

## File Uploads

This project uses a single upload endpoint at `POST /api/upload`.

- **On Vercel**: uploads go to **Vercel Blob Storage** and the API returns a public Blob URL.
- **Locally (no Blob token)**: uploads fall back to writing under `public/uploads/...`.

The returned `data.url` should be stored directly in the database fields such as `photo`, `signature`, and `evidence.file_path`.

File uploads are handled by `/api/upload` (POST) and stored in `public/uploads/`.

### Supported Categories & Storage

| Category | Storage Path | Accepted Types |
|----------|-------------|----------------|
| `stations` | `public/uploads/stations/` | Images (JPEG, PNG, GIF, WebP) |
| `officers` | `public/uploads/officers/` | Images |
| `persons` | `public/uploads/persons/` | Images |
| `signatures` | `public/uploads/signatures/` | Images |
| `evidence` | `public/uploads/evidence/` | Images, Video (MP4, WebM, AVI, MOV), Audio (MP3, WAV, OGG, WebM), Documents (PDF, DOC, DOCX, XLS, XLSX, CSV, TXT) |

### Upload Flow

1. Client sends `multipart/form-data` with `file` and `category` fields
2. Server validates MIME type against allowed types for the category
3. File is saved with a unique name (`{timestamp}-{random}-{originalname}`)
4. Returns the public URL path (e.g., `/uploads/evidence/1708234567-abc123-photo.jpg`)

---

## Scripts & Database Utilities

### Database SQL Files

| File | Purpose |
|------|---------|
| [database/schema.sql](database/schema.sql) | Creates all 9 tables with indexes |
| [database/seed_complete.sql](database/seed_complete.sql) | Complete seed data for all tables |
| [database/seed_officers.sql](database/seed_officers.sql) | Seed data for officers |
| [database/seed_teku_cases.sql](database/seed_teku_cases.sql) | Sample cases for Teku station |
| [database/seed_users_persons.sql](database/seed_users_persons.sql) | Seed data for users and persons |
| [database/reset_database.sql](database/reset_database.sql) | Drop and recreate all tables |

### Utility Scripts

| Script | Purpose |
|--------|---------|
| [scripts/generate-hash.js](scripts/generate-hash.js) | Generate a bcrypt hash for any string |
| [scripts/generate-admin123-hash.js](scripts/generate-admin123-hash.js) | Generate bcrypt hash for `admin123` |
| [scripts/generate-password-hash.js](scripts/generate-password-hash.js) | Generate password hash |
| [scripts/verify-password.js](scripts/verify-password.js) | Verify a password against a hash |
| [scripts/init-admin.sql](scripts/init-admin.sql) | SQL to initialize the admin user |

---

## Environment Variables

### Vercel Blob

- `BLOB_READ_WRITE_TOKEN` – required for uploading to Vercel Blob.
   - In Vercel: create a Blob store and add the token as an environment variable.
   - Locally: set this if you want uploads to go to Blob while developing.

Create a `.env.local` file in the project root:

```env
# Database (PostgreSQL)
# Preferred: online DB connection string
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
# Optional: if your hosted provider requires SSL
DB_SSL=true

# Fallback: local DB connection settings
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=admin
DB_NAME=national_crime_records
DB_PORT=5432

# Session
SESSION_SECRET=complex_password_at_least_32_characters_long
SESSION_NAME=fir_session
SESSION_TTL=86400

# Node Environment
NODE_ENV=development
```

> **Note:** Email credentials for `nodemailer` are currently configured directly in [lib/email.ts](lib/email.ts).

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+
- **npm** or **yarn**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd national_crime_records
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up the database**

   ```bash
   # Create the database
   psql -U postgres -c "CREATE DATABASE national_crime_records;"

   # Run schema
   psql -U postgres -d national_crime_records -f database/schema.sql

   # Seed with sample data (optional)
   psql -U postgres -d national_crime_records -f database/seed_complete.sql
   ```

4. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database credentials
   ```

5. **Initialize admin user**

   ```bash
   # Option A: Via SQL
   psql -U postgres -d national_crime_records -f scripts/init-admin.sql

   # Option B: Via API (after starting the server)
   curl http://localhost:3000/api/auth/reset-admin
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

7. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Login

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |

### Build for Production

```bash
npm run build
npm start
```

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                        Client (Browser)                   │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Login   │  │Dashboard │  │  Cases   │  │ Officers │  │
│  │  Page    │  │(Admin/   │  │(List/    │  │(List/    │  │
│  │         │  │Station/  │  │Detail/   │  │Detail/   │  │
│  │         │  │Officer)  │  │New)      │  │New/Edit) │  │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │            │             │              │         │
│  ┌────┴────────────┴─────────────┴──────────────┴─────┐  │
│  │              UserContext + Navbar                   │  │
│  └────────────────────────┬───────────────────────────┘  │
└───────────────────────────┼──────────────────────────────┘
                            │ HTTP (fetch)
┌───────────────────────────┼──────────────────────────────┐
│                     Next.js Server                        │
│  ┌────────────────────────┴───────────────────────────┐  │
│  │                   Middleware                        │  │
│  │          (Auth check + Role-based routing)          │  │
│  └────────────────────────┬───────────────────────────┘  │
│                           │                               │
│  ┌────────────────────────┴───────────────────────────┐  │
│  │              API Route Handlers                     │  │
│  │  /api/auth/*  /api/cases/*  /api/officers/*  ...   │  │
│  └────────────────────────┬───────────────────────────┘  │
│                           │                               │
│  ┌────────────────────────┴───────────────────────────┐  │
│  │              Library Layer                          │  │
│  │  auth.ts │ db.ts │ permissions.ts │ email.ts       │  │
│  └────────────────────────┬───────────────────────────┘  │
└───────────────────────────┼──────────────────────────────┘
                            │ SQL (pg)
┌───────────────────────────┼──────────────────────────────┐
│                      PostgreSQL                           │
│  police_stations │ officers │ cases │ persons │ users     │
│  case_persons │ evidence │ fir_track_records │ ...        │
└──────────────────────────────────────────────────────────┘
```

---

*Nepal Police — National Crime Records Management System*
