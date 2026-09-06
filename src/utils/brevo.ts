interface BrevoEmailParams {
  to: string;
  toName?: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: number;
  params?: Record<string, any>;
}

interface BrevoResponse {
  messageId?: string;
  error?: string;
}

export const sendBrevoEmail = async (emailData: BrevoEmailParams): Promise<BrevoResponse> => {
  const apiKey = process.env.EXPO_PUBLIC_BREVO_API_KEY;
  const appName = process.env.EXPO_PUBLIC_APP_NAME || 'Gym Journey';
  const appUrl = process.env.EXPO_PUBLIC_APP_URL || 'https://yourapp.com';
  const senderEmail = process.env.EXPO_PUBLIC_SENDER_EMAIL || 'support@gymjourney';

  if (!apiKey) {
    console.error('Brevo API key is missing. Please check your .env file.');
    return { error: 'Brevo API key is missing' };
  }

  try {
    const endpoint = emailData.templateId 
      ? 'https://api.brevo.com/v3/smtp/email'
      : 'https://api.brevo.com/v3/smtp/email';

    const payload = emailData.templateId
      ? {
          to: [{ email: emailData.to, name: emailData.toName || emailData.to }],
          templateId: emailData.templateId,
          params: {
            ...emailData.params,
            APP_NAME: appName,
            APP_URL: appUrl,
          },
        }
      : {
          sender: {
            name: appName,
            email: senderEmail,
          },
          to: [{ email: emailData.to, name: emailData.toName || emailData.to }],
          subject: emailData.subject,
          htmlContent: emailData.htmlContent,
          textContent: emailData.textContent,
        };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API error:', errorData);
      return { error: errorData.message || 'Failed to send email' };
    }

    const data = await response.json();
    return { messageId: data.messageId };
  } catch (error) {
    console.error('Brevo email error:', error);
    return { error: 'Failed to send email' };
  }
};

// Predefined email functions
export const sendWelcomeEmail = async (to: string, toName: string) => {
  return sendBrevoEmail({
    to,
    toName,
    subject: `Welcome to ${process.env.EXPO_PUBLIC_APP_NAME || 'Gym Journey'}!`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to ${process.env.EXPO_PUBLIC_APP_NAME || 'Gym Journey'}!</h2>
        <p>Hi ${toName},</p>
        <p>Thank you for signing up! Your account has been successfully created.</p>
        <p>You can now access your dashboard and start your fitness journey.</p>
        <p>
          <a href="${process.env.EXPO_PUBLIC_APP_URL || 'https://yourapp.com'}/login" 
             style="background-color: #E88E83; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Login to Your Account
          </a>
        </p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>${process.env.EXPO_PUBLIC_APP_NAME || 'Gym Journey'} Team</p>
      </div>
    `,
  });
};

export const sendAdminApprovalEmail = async (to: string, toName: string) => {
  const firstName = toName.split(' ')[0];
  return sendBrevoEmail({
    to,
    toName,
    subject: 'Your Admin Account Has Been Approved',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Admin Account Approved! 🎉</h2>
        <p>Hi ${firstName},</p>
        <p>Great news! Your admin account for <strong>${process.env.EXPO_PUBLIC_APP_NAME || 'Gym Journey'}</strong> has been approved by a super admin.</p>
        <p>You can now log in and access the admin dashboard to manage gym operations.</p>
        <p>
          <a href="${process.env.EXPO_PUBLIC_APP_URL || 'https://yourapp.com'}/login" 
             style="background-color: #E88E83; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Access Admin Dashboard
          </a>
        </p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Important:</strong> Please secure your account and review our admin guidelines.</p>
        </div>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>${process.env.EXPO_PUBLIC_APP_NAME || 'Gym Journey'} Team</p>
      </div>
    `,
  });
};

export const sendAdminRejectionEmail = async (to: string, toName: string, reason?: string) => {
  const firstName = toName.split(' ')[0];
  return sendBrevoEmail({
    to,
    toName,
    subject: 'Update on Your Admin Application',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Admin Application Update</h2>
        <p>Hi ${firstName},</p>
        <p>We wanted to inform you about the status of your admin application for <strong>${process.env.EXPO_PUBLIC_APP_NAME || 'Gym Journey'}</strong>.</p>
        ${reason ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
        ` : ''}
        <p>If you believe this is an error or would like to discuss this further, please contact our support team.</p>
        <p>Best regards,<br>${process.env.EXPO_PUBLIC_APP_NAME || 'Gym Journey'} Team</p>
      </div>
    `,
  });
};

export const sendPendingAdminNotification = async (to: string, toName: string, adminName: string, adminEmail: string) => {
  return sendBrevoEmail({
    to,
    toName,
    subject: 'New Admin Application Pending Approval',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Admin Application</h2>
        <p>Hi ${toName},</p>
        <p>A new admin application has been submitted and requires your approval.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Applicant Name:</strong> ${adminName}</p>
          <p><strong>Applicant Email:</strong> ${adminEmail}</p>
        </div>
        <p>Please review the application and approve or reject it in your admin dashboard.</p>
        <p>
          <a href="${process.env.EXPO_PUBLIC_APP_URL || 'https://yourapp.com'}/user-management" 
             style="background-color: #E88E83; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Review Application
          </a>
        </p>
        <p>Best regards,<br>${process.env.EXPO_PUBLIC_APP_NAME || 'Gym Journey'} Team</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (to: string, toName: string, resetLink: string) => {
  const firstName = toName.split(' ')[0];
  return sendBrevoEmail({
    to,
    toName,
    subject: 'Password Reset Request',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password for your <strong>${process.env.EXPO_PUBLIC_APP_NAME || 'Gym Journey'}</strong> account.</p>
        <p>If you made this request, click the button below to reset your password:</p>
        <p>
          <a href="${resetLink}" 
             style="background-color: #E88E83; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </p>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
        </div>
        <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
        <p>Best regards,<br>${process.env.EXPO_PUBLIC_APP_NAME || 'Gym Journey'} Team</p>
      </div>
    `,
  });
};