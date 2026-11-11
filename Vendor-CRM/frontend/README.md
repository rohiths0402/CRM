# Production House CRM

Fresh frontend scaffold for the Production House CRM.

## Tech stack

- React 18
- Vite 6
- JavaScript (ES modules)
- CSS (initial dark theme foundation)

## Getting started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build

```bash
npm run build
```

## Environment variables

Copy `.env.example` to `.env` and update the API base URL when the backend contract is ready.

- `VITE_API_BASE_URL`: Backend API base URL.
- `VITE_USE_MOCK_DATA`: Set to `true` while developing with mock data.

## Project structure

- `src/components`: Reusable UI components
- `src/pages`: CRM pages grouped by module
- `src/services`: API integration layer
- `src/hooks`: Reusable React hooks
- `src/context`: Shared application state
- `src/routes`: Route configuration
- `src/mocks`: Development mock data
- `src/utils`: Formatting and helper functions

Backend endpoints are intentionally not assumed. Confirm the API contract with the backend team before implementing live integrations.
