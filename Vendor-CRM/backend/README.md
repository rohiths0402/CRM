# Production House CRM – Backend

Spring Boot 3.5 (Java 21) + MySQL. It serves the auth APIs the React app in `../frontend` calls at `http://localhost:5000/api`.

## Run

All settings come from environment variables (defaults are in `src/main/resources/application.properties`).

| Variable | Default | Notes |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/production_house_crm?createDatabaseIfNotExist=true...` | The database is created on first start |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `root` | |
| `MAIL_USERNAME` | – | Your Gmail address |
| `MAIL_PASSWORD` | – | A Gmail **App password** (not your normal password) |
| `MAIL_FROM_NAME` | `Production House CRM` | |
| `JWT_SECRET` | dev placeholder | At least 32 characters; always set it outside local dev |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated |

PowerShell:

```powershell
$env:DB_PASSWORD="your-mysql-password"
$env:MAIL_USERNAME="you@gmail.com"
$env:MAIL_PASSWORD="abcd efgh ijkl mnop"
$env:JWT_SECRET="a-long-random-string-of-at-least-32-characters"
.\mvnw.cmd spring-boot:run
```

Tables (`users`, `password_reset_otps`) are created automatically (`ddl-auto=update`).

### Free SMTP with Gmail

1. Turn on 2-Step Verification for the Google account.
2. Open https://myaccount.google.com/apppasswords, create an app password, and copy the 16 characters.
3. Use it as `MAIL_PASSWORD`. Gmail allows about 500 emails a day on a free account.

Any other SMTP provider works too: set `MAIL_HOST` and `MAIL_PORT` as well (for example Brevo: `smtp-relay.brevo.com`, `587`).

## API

Every error response is `{ "message": "..." }`. Validation errors add `"errors": { "field": "message" }`.

| Method | Path | Body | Success |
|---|---|---|---|
| POST | `/api/auth/register` | `{ fullName, company, email, mobile?, password }` | `201 { message, user }` |
| POST | `/api/auth/login` | `{ email, password, rememberMe }` | `200 { message, token, tokenType, expiresIn, user }` |
| POST | `/api/auth/forgot-password` | `{ email }` | `200 { message }` (always the same message, whether or not the email exists) |
| POST | `/api/auth/verify-otp` | `{ email, otp }` | `200 { message }` |
| POST | `/api/auth/reset-password` | `{ email, otp, password }` | `200 { message }` |
| GET | `/api/auth/me` | header `Authorization: Bearer <token>` | `200 user` |

### CRM modules

Every module below needs `Authorization: Bearer <token>` and exposes the same five endpoints:
`GET /api/<path>` (list, newest first), `GET /api/<path>/{id}`, `POST /api/<path>`, `PUT /api/<path>/{id}` (full replace), `DELETE /api/<path>/{id}` (returns `{ success, message }`).
JSON field names are exactly the ones the frontend forms use. Each user only sees and changes their own workspace's records (see Logins and access below).

### Production CRM

Needs a login with `ALL` or `PRODUCTION` access.

| Module (UI page) | Path | Notes |
|---|---|---|
| Production Houses | `/production-houses` | |
| OTT Projects | `/ott-projects` | `budget` feeds Budgets & Dashboard. Can't delete a project that has expenses. |
| Cast & Crew | `/cast-crew` | |
| Production Schedules | `/schedules` | `startTime`/`endTime` are `"HH:mm"`; set `endsNextDay: true` for overnight shoots |
| Shooting Locations | `/locations` | |
| Budgets & Expenses | `/expenses` | `projectId` must be one of your OTT project ids |
| Budgets summary | `GET /budgets?projectId=` | Per-project budget/spent/remaining/percentage, plus totals (incl. unpaid) |
| Contracts | `/contracts` | Response adds read-only `contractCode` like `CON-007` |
| Team Coordination: tasks | `/tasks` | `assignee` is a team member's name |
| Team Coordination: members | `/team-members` | Can't delete a member who still has tasks assigned |
| Payments | `/payments` | `paymentDate` is required when `status` is `Completed` |
| Dashboard | `GET /dashboard` | Stat counts, project overview, budget snapshot, upcoming schedules, pending actions, recent activity |

### Vendor CRM

Needs a login with `ALL` or `VENDOR` access. Records link to each other by numeric id.

| Module (UI page) | Path | Notes |
|---|---|---|
| Vendors | `/vendor/vendors` | `category`, GSTIN/PAN/IFSC (upper-cased), bank details, `paymentTerms`, `rating` 1–5, `status` Active/Inactive/Blacklisted. Can't delete a vendor with any linked records. |
| Quotations | `/vendor/quotations` | `vendorId`, `project` (OTT project name). `amount` required once `status` is Received. Adds read-only `quoteCode` (QT-001) and `totalAmount` (with tax). |
| Purchase Orders | `/vendor/purchase-orders` | Optional `quotationId` (same vendor); raising an order from a quote marks it Accepted. Blacklisted vendors are refused. Adds `poNumber`, `totalAmount`. |
| Invoices | `/vendor/invoices` | Optional `purchaseOrderId`. Read-only `paidAmount`, `balance`, `overdue` follow the completed payments, and so do the Paid / Partially Paid statuses. |
| Payments | `/vendor/payments` | Optional `invoiceId` (same vendor). A Completed payment can't exceed the invoice balance. |
| Documents | `/vendor/documents` | Read-only `expiryStatus`: No Expiry, Valid, Expiring Soon (≤ 30 days), Expired. |
| Vendor dashboard | `GET /vendor/dashboard` | Stats, quotation pipeline, spend by category, top vendors, payments due in 14 days, document alerts, recent orders |
| Project names | `GET /vendor/projects` | OTT project names for the vendor forms (vendor-only logins can't read `/ott-projects`) |

### Logins and access

- Signing up creates a workspace **admin** with access to both CRMs.
- The admin adds the other logins from **Users & Access** (`/users`, admin only). Each login gets `access`: `ALL`, `PRODUCTION` or `VENDOR`.
- Every login in a workspace sees the same records. Each record's `owner_id` is the admin's user id.
- A login without access to a section gets `403 { message }`. Access changes apply on the login's next request.

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/api/users` | | The admin first, then the logins they added |
| POST | `/api/users` | `{ fullName, email, mobile?, access, password }` | `201 user`; the company is the admin's |
| PUT | `/api/users/{id}` | `{ fullName, mobile?, access }` | The email and password stay as they are |
| DELETE | `/api/users/{id}` | | The login is removed; the records it created stay in the workspace |

`user` objects (login, `/auth/me`, `/users`) include `access` and `admin`.

Dates are `"YYYY-MM-DD"`. Money is returned as a number. Empty strings for optional dates/numbers are accepted and stored as null.
Run `.\mvnw.cmd test` to exercise every endpoint against an in-memory database (no MySQL needed).

### Rules

- Passwords need 8+ characters with an uppercase letter, a lowercase letter, a number and a special character (same as the frontend).
- Login tokens last 60 minutes, or 30 days with `rememberMe`.
- OTPs are 6 digits, valid for 10 minutes, and allow 5 wrong tries. A new one can be requested every 60 seconds; asking again replaces the old code.
- OTPs and passwords are stored as BCrypt hashes only.
