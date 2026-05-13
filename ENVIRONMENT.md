# Environment Variable Setup

This project stores sensitive credentials on the server only using environment variables.

## Required variables

- `ADMIN_EMAIL` - administrator login email
- `ADMIN_PASSWORD` - administrator login password
- `AUTH_TOKEN_SECRET` - secret key used to sign auth cookies and validate sessions
- `EMAIL_SERVICE` - email service provider name, e.g. `gmail`
- `EMAIL_USER` - sender email address for Nodemailer
- `EMAIL_PASSWORD` - email account password or app-specific password
- `EMAIL_FROM` - optional sender address shown in outgoing messages

## Local development

1. Copy `.env.example` to `.env.local`.
2. Update the values with your secure admin and email credentials.

Example `.env.local`:

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SuperSecurePassword123!
AUTH_TOKEN_SECRET=your-strong-random-secret
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

For Gmail, use an app password instead of your primary account password.
If your provider requires SMTP host/port settings, update `EMAIL_SERVICE` accordingly or extend the transporter configuration.

`AUTH_TOKEN_SECRET` should be a long, random string that only the server knows. It is used to sign and validate auth session cookies so direct access to protected pages like `/upload` requires a valid login session.

## Security rules

- Do NOT expose secrets using `NEXT_PUBLIC_`.
- Do NOT store passwords in client-side code, local storage, or session storage.
- Keep authentication logic server-side in API routes.
- `.env.local` is ignored by git and should never be committed.

## Deployment

Configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` via your hosting provider's environment variable settings.

In production, `app/api/auth/login/route.js` reads these variables from `process.env` and never exposes them to browser JavaScript.

## Running locally

- Install dependencies: `npm install`
- Start the development server: `npm run dev`

Open the app in your browser at `http://localhost:3000`.

## Notes

- `.env.example` is safe to commit and shows the required variable names.
- `.env.local` is kept out of git by `.gitignore`.
- If `ADMIN_EMAIL` or `ADMIN_PASSWORD` are missing, login requests return a server error.
