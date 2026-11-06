# Franchise CRM Backend — Authentication Foundation

Feature-based Django REST Framework backend using MySQL, bcrypt password hashing, JWT access tokens, and HttpOnly refresh-token cookies.

## Architecture

- `modules/accounts` is a Django domain app.
- `modules/accounts/features/authentication` contains the authentication feature.
- `models/` contains the domain's Django models; migrations remain at the Django app root.
- Future business domains can be added as separate Django apps under `modules/` (for example `modules/events`, `modules/franchises`, `modules/partners`).
- Do not create a separate Django app for every small feature.

## Requirements

- Python 3.11+
- MySQL 8+
- MySQL development client/build dependencies if a prebuilt `mysqlclient` wheel is unavailable.

## Windows setup

From this directory in CMD:

```cmd
py -m venv venv
venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` with your MySQL credentials. Create the database:

```sql
CREATE DATABASE franchise_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then create the first migration for the custom user model and migrate:

```cmd
python manage.py makemigrations accounts
python manage.py migrate
python manage.py createsuperuser
python manage.py check
python manage.py runserver
```

**Important:** Set `AUTH_USER_MODEL = "accounts.User"` before the first migration. This project already does so. Do not migrate using Django's default user model first.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/auth/csrf/` | Set CSRF cookie and return CSRF token |
| POST | `/api/auth/register/` | Register a normal user |
| POST | `/api/auth/login/` | Login with email, password, role and remember_me |
| POST | `/api/auth/refresh/` | Rotate refresh token and return a new access token |
| POST | `/api/auth/logout/` | Blacklist refresh token and clear cookie |
| GET | `/api/auth/me/` | Return authenticated user |

### Registration

```json
{
  "email": "person@example.com",
  "username": "person",
  "role": "user",
  "password": "Use-A-Strong-Password-123!"
}
```

Public registration only permits the `user` role. Admins must be created through a trusted administrative process.

### Login

```json
{
  "email": "person@example.com",
  "password": "Use-A-Strong-Password-123!",
  "role": "user",
  "remember_me": true
}
```

The access token is returned in JSON and should be kept in frontend memory only. The refresh token is set as an HttpOnly cookie and is never returned in JSON.

### Frontend cookie/CSRF flow

1. Call `GET /api/auth/csrf/` with `credentials: "include"`.
2. Read the `csrftoken` cookie and send its value in the `X-CSRFToken` header on login, refresh and logout.
3. Send all cookie-based requests with `credentials: "include"`.
4. Keep the returned access token in memory (for example React state/context), not localStorage/sessionStorage.
5. Send API requests with `Authorization: Bearer <access-token>`.

Example:

```javascript
await fetch("http://127.0.0.1:8000/api/auth/csrf/", {
  credentials: "include"
});

await fetch("http://127.0.0.1:8000/api/auth/login/", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": readCookie("csrftoken")
  },
  body: JSON.stringify({
    email,
    password,
    role,
    remember_me: true
  })
});
```

`readCookie` is a frontend helper that reads the CSRF cookie. The refresh cookie itself is HttpOnly and cannot be read by JavaScript.

## Password hashing

Django's password framework is configured with `BCryptSHA256PasswordHasher`. The `set_password()` method performs salted bcrypt-based hashing. Passwords must never be manually hashed in views or stored in plaintext.

## Security notes before production

- Set a strong, unique `SECRET_KEY`; set `DEBUG=False`.
- Configure real production `ALLOWED_HOSTS`, HTTPS, secure cookies and trusted origins.
- Use `COOKIE_SECURE=True` in HTTPS environments.
- Review `COOKIE_SAMESITE` and CSRF/CORS configuration if frontend and API are on different sites. Cross-site cookies generally require `SameSite=None; Secure`.
- Add rate limiting / throttling, email verification, password reset, audit logging and operational monitoring before production.
- The role supplied during login is only a consistency check. Authorization always uses the role stored on the authenticated database user.
- Refresh tokens are rotated and blacklisted. The blacklist app's tables are created by migrations.

## Adding another domain

Create a new Django app under `modules/`, for example:

```cmd
python manage.py startapp events modules/events
```

Then set its `AppConfig.name` to `modules.events`, add it to `INSTALLED_APPS`, and include its URLs under an appropriate API prefix. Keep its models and migrations inside that domain app.
