# Event CRM

Event CRM is a web app for planning and running live events. The repository has a React frontend and a Spring Boot API backed by MySQL.

## Project layout

```text
Event_CRM/
├── backend/      Spring Boot API
└── Frontend/     React, Vite, and Tailwind CSS 
```

The frontend opens at the login page. Its sidebar and protected routes follow the user's role.

## What is in the CRM

- Operations dashboard, events, venues, ticketing, sponsors, artist lineups, and gate check-in
- Inbound proposals, event profit and loss, and crew assignments
- User profile with editable contact details and a profile picture
- Super Admin workspace settings for organization details, regional preferences, notifications, theme, and role access
- Role-based navigation for Super Admin, Admin, and Employee accounts

### Pages still using frontend data

Inbound Proposals, Financials & P&L, and Crew & Staff are not connected to backend services yet. Their records are currently kept in browser storage, so changes are local to that browser and are not shared with other users.

The backend already has proposal endpoints under `/api/proposals`, but the Inbound Proposals page has not been wired to them. Financials and Crew & Staff do not have backend APIs yet. Financials and Crew can use the Events API for event names when the frontend is configured for the backend; their expense and crew records are still local.

Profile edits and uploaded profile pictures are also stored in the browser. Profile pictures can be JPG, PNG, or WebP files up to 2 MB.

### System Settings

Super Admins can update organization contact details, regional preferences, and notification preferences, change the theme, and review the role access summary. These settings are saved in the current browser and are not synced to the backend.

## Requirements

- Node.js 20.19
- Java 21
- MySQL

## Run locally

### Backend

Create a MySQL user/password, then open PowerShell:

```powershell
cd .\Event_CRM\backend
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "<your-mysql-password>"
$env:SEED_PASSWORD = "<password-for-seeded-users>"
.\mvnw.cmd spring-boot:run
```

The API listens on port `8084`. The configured JDBC URL creates the `event_crm` database if it does not exist and the MySQL user has permission to do so.

On a new database, the app seeds these accounts when the users table is empty:

| Email | Role |
| --- | --- |
| `superadmin@loop.local` | Super Admin |
| `admin@loop.local` | Admin |
| `employee@loop.local` | Employee |

Use the password you set in `SEED_PASSWORD`. The seeder does not replace or add accounts once the users table already contains data.

Mail settings are optional for features that send email. Set `MAIL_USERNAME` and `MAIL_PASSWORD` in the environment when needed.

### Frontend

In another PowerShell window:

```powershell
cd .\Event_CRM\Frontend
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173`.

The included `.env` uses mock mode (`VITE_USE_MOCK=true`). To use the local backend instead, update the frontend `.env`:

```dotenv
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8084/api
```

The backend's configured frontend origin is `http://localhost:5173`. If Vite runs on a different port, update `app.frontend-url` in the backend configuration to match.

## Access rules

The frontend uses the same seeded roles as the backend:

- **Super Admin:** all modules, including System Settings
- **Admin:** operational modules, but not System Settings
- **Employee:** Operations Dashboard, Gate Check-In, and My Profile

Backend API requests require an authenticated session, except login and password-reset endpoints. The backend restricts `POST`, `PUT`, `PATCH`, and `DELETE` requests to Super Admin and Admin. Gate endpoints are available to any authenticated user.

## Useful commands

From `Event_CRM/Frontend`:

```powershell
npm run dev
npm run build
npm run lint
```

From `Event_CRM/backend`:

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```
