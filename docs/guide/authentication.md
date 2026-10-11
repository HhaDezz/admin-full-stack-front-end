# Sign-in and sign-up

Everything here works against the real API, and in demo mode without it.

## Pages

| Page | Path | What it does |
|---|---|---|
| Sign in | `/login` | Email and password; asks for a code when two-step sign-in is on; explains locked, disabled and unconfirmed accounts |
| Sign up | `/register` | Name, email, password with a strength meter, terms. Hidden when sign-up is off in the API |
| Confirm email | `/verify-email?token=…` | Opened from the emailed link |
| Forgot password | `/forgot-password` | Sends a reset link (always says it did, so it doesn't reveal who has an account) |
| Reset password | `/reset-password?token=…` | Checks the link first; a new password signs out every device |
| Lock screen | `/lock` | After a chosen idle time or from the user menu; the password unlocks it |

## Two-step sign-in

People turn it on in **Settings → Security**: they confirm their password, scan a QR code with an authenticator app (or type the key), enter a code, and get **10 recovery codes** to keep. After that, signing in asks for a six-digit code, or a recovery code if the phone is lost. Each recovery code works once.

- Codes follow RFC 6238 (30-second steps, one step of clock drift allowed), and a code can't be used twice.
- Secrets are encrypted in the database with a key derived from `JWT_SECRET`.
- An admin can turn two-step off for someone who lost their phone (**Users → ⋯ → Reset two-step sign-in**).

## Sessions and devices

Every sign-in creates a session. **Settings → Security → Devices** lists them with browser, system, address and last activity; people can sign out one device or every other device. Changing the password signs out the others, and resetting it signs out all of them.

A sign-in from a new browser creates a security notification (and an email, if the person wants those).

## Sign-up settings

| Setting | Effect |
|---|---|
| `REGISTRATION_ENABLED=false` | Only people an admin adds can sign in; the sign-up link disappears |
| `REGISTRATION_REQUIRE_VERIFICATION=false` | New accounts can sign in before confirming their email |
| `REGISTRATION_DEFAULT_ROLE` | The role new accounts get (default `USER`) |

## Brute force and abuse

Five wrong passwords lock an account for 15 minutes (`MAX_LOGIN_ATTEMPTS`, `LOGIN_LOCKOUT`), and wrong two-step codes count the same way. Sign-ups are limited per IP address, and reset and resend requests per email address. The counters are kept in memory: if you run several API instances, each counts on its own.
