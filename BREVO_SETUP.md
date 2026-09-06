# Brevo Email Integration Setup Guide

## Overview
This application is integrated with Brevo (formerly Sendinblue) for transactional emails including user registration, admin approvals, and notifications.

## Configuration Steps

### 1. Get Brevo API Credentials
1. Sign up/login at [https://www.brevo.com](https://www.brevo.com)
2. Navigate to **SMTP & API** → **API Keys**
3. Click **"Create a new API key"**
4. Name it (e.g., "Gym Journey App")
5. Copy the generated API key

### 2. Update Environment Variables
Add your Brevo API key to `.env` file:

```env
EXPO_PUBLIC_BREVO_API_KEY=your_actual_brevo_api_key_here
EXPO_PUBLIC_APP_NAME=Gym Journey
EXPO_PUBLIC_APP_URL=https://yourapp.com
```

### 3. Configure Supabase Custom SMTP (required for signup verification)

Supabase’s **default** mailer only delivers to emails on your **organization team**.
Signups like `you@gmail.com` fail with `email_address_invalid` / not authorized until Custom SMTP is on.

1. Go to [Brevo SMTP & API](https://app.brevo.com/settings/keys/smtp) and copy the **SMTP key** (not only the REST API key).
2. Supabase Dashboard → **Authentication** → **Emails** (or **Providers** → Email) → **SMTP Settings**
3. Enable **Custom SMTP** and enter:
   - **Host**: `smtp-relay.brevo.com`
   - **Port**: `587`
   - **Username**: your Brevo login email
   - **Password**: Brevo SMTP key
   - **Sender email**: a verified sender in Brevo (or your Brevo account email while testing)
   - **Sender name**: Forge Gym
4. Also add redirect URLs under **Authentication** → **URL Configuration**:
   - `http://localhost:8081/email-verification`
   - your production `/email-verification`
   - `gymjourney://email-verification`

**Quick local bypass (no verification emails):** Authentication → Providers → Email → turn **Confirm email** off. Signup will skip the mailer restriction, then the app goes straight to Login.

## Email Templates

### Welcome Email (Customer Registration)
- **Trigger**: When a new customer registers
- **Content**: Welcome message with login link
- **Function**: `sendWelcomeEmail()`

### Admin Approval Email
- **Trigger**: When a super admin approves an admin application
- **Content**: Approval notification with dashboard access link
- **Function**: `sendAdminApprovalEmail()`

### Admin Rejection Email
- **Trigger**: When a super admin rejects an admin application
- **Content**: Rejection notification with optional reason
- **Function**: `sendAdminRejectionEmail()`

### Pending Admin Notification
- **Trigger**: When someone applies for admin role
- **Content**: Notifies super admins of new application
- **Function**: `sendPendingAdminNotification()`

## Testing

### Test Email Sending
Create a test file to verify Brevo integration:

```typescript
import { sendWelcomeEmail } from './src/utils/brevo';

const testEmail = async () => {
  const result = await sendWelcomeEmail('test@example.com', 'Test User');
  console.log('Email result:', result);
};

testEmail();
```

### Test Registration Flow
1. Register as a customer → should receive welcome email
2. Register as an admin → super admins should receive notification
3. Approve admin → admin should receive approval email

## Customization

### Email Templates
To customize email templates, edit the HTML content in `src/utils/brevo.ts`:

```typescript
export const sendWelcomeEmail = async (to: string, toName: string) => {
  return sendBrevoEmail({
    to,
    toName,
    subject: `Welcome to ${process.env.EXPO_PUBLIC_APP_NAME}!`,
    htmlContent: `
      <!-- Your custom HTML here -->
    `,
  });
};
```

### Add New Email Types
1. Create a new function in `src/utils/brevo.ts`
2. Use the `sendBrevoEmail` helper function
3. Add your custom HTML content
4. Call it from your components or AuthContext

## Troubleshooting

### Emails Not Sending
1. Check that `EXPO_PUBLIC_BREVO_API_KEY` is set correctly
2. Verify your Brevo account has sufficient credits
3. Check browser console for error messages
4. Ensure sender email is verified in Brevo

### API Key Issues
- Make sure you're using the API key (not SMTP key)
- API keys should start with `xkeysib-`
- Regenerate key if needed

### Environment Variables
- Restart your development server after changing `.env`
- Variables must start with `EXPO_PUBLIC_` to be accessible in React Native

## Security Notes
- Never commit your `.env` file to version control
- Use different API keys for development and production
- Monitor Brevo usage to prevent exceeding limits
- Keep API keys secure and rotate them periodically