# Email

The API sends four kinds of email: confirm your address, reset your password, a new sign-in to your account, and notifications people chose to get by email.

## In development

Leave `MAIL_HOST` empty. Each email is written to the API log instead, with its link:

```
Email (no SMTP configured, set spring.mail.host to send):
  To: grace@example.com
  Subject: Confirm your email address
  …
  http://localhost:5173/verify-email?token=…
```

In demo mode the web app shows the same links in a *demo inbox* on the page.

## In production

```properties
MAIL_HOST=smtp.postmarkapp.com
MAIL_PORT=587
MAIL_USERNAME=…
MAIL_PASSWORD=…
MAIL_FROM=Anjana Admin <no-reply@yourdomain.com>
WEB_URL=https://admin.yourdomain.com
```

`WEB_URL` must be the web app's public address, or links in emails won't open. Any SMTP service works (Postmark, SendGrid, Amazon SES, Mailgun, your own server). Emails are sent in the background, so a slow mail server never slows a request down; failures are logged.

Links expire: confirmation links after 24 hours, reset links after 1 hour. Asking for a new link retires the old one.
