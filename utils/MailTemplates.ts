export const DaysBeforeMailTemplate = (
  day: number,
  eventName: string,
  name: string,
  eventDate: string,
  eventLink: string
) => {
  return (`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Event Reminder - ${day} Day${day > 1 ? 's' : ''} Left</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #D1F8EF; color: #1F2937;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #FFFFFF; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <tr>
        <td style="padding: 20px; background-color: #1E3A8A; color: white; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">${eventName}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <h2 style="margin: 0 0 10px;">📅 Just ${day} Day${day > 1 ? 's' : ''} Left!</h2>
          <p style="margin: 0 0 20px; color: #6B7280;">Hi ${name},</p>
          <p style="margin: 0 0 20px;">
            We're excited to remind you that the event <strong>${eventName}</strong> is happening in just ${day} day${day > 1 ? 's' : ''}!
          </p>
          <p style="margin: 0 0 20px;">
            🕒 <strong>Date:</strong> ${eventDate}
          </p>
          <a href="${eventLink}" style="display: inline-block; background-color: #F97316; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none;">
            View Event Details
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #F9FAFB; text-align: center; color: #6B7280; font-size: 14px;">
          Thank you for being a part of this impactful journey ❤️<br />— The Hussaini Welfare Association Team
        </td>
      </tr>
    </table>
  </body>
</html>
`);
}

export const EventRegistrationTemplate = (
  name: string,
  eventName: string,
  eventDate: string,
  eventLink: string
) => {
  return (`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>You're Registered for ${eventName}!</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #E0F7FA; color: #1F2937;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #FFFFFF; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <tr>
        <td style="padding: 20px; background-color: #10B981; color: white; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">Registration Confirmed!</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <p style="margin: 0 0 20px; color: #6B7280;">Hi ${name},</p>
          <p style="margin: 0 0 20px;">
            🎉 Thank you for registering for <strong>${eventName}</strong>! We're excited to have you with us.
          </p>
          <p style="margin: 0 0 20px;">
            🗓️ <strong>Date:</strong> ${eventDate}
          </p>
          <p style="margin: 0 0 20px;">
            You can view all the details and updates using the link below:
          </p>
          <a href="${eventLink}" style="display: inline-block; background-color: #3B82F6; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none;">
            View Event Details
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #F9FAFB; text-align: center; color: #6B7280; font-size: 14px;">
          We're looking forward to seeing you there! ❤️<br />— The Hussaini Welfare Association Team
        </td>
      </tr>
    </table>
  </body>
</html>
`);
}

export const ContactFormAutoReplyTemplate = (name: string) => {
  return (`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Thanks for Reaching Out!</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #F3F4F6; color: #1F2937;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #FFFFFF; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <tr>
        <td style="padding: 20px; background-color: #10B981; color: white; text-align: center; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">We Received Your Message</h2>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <p style="margin: 0 0 20px;">Hi ${name},</p>
          <p style="margin: 0 0 20px;">
            👋 Thank you for contacting <strong>Hussaini Welfare Association</strong>. We’ve received your message and will get back to you shortly.
          </p>
          <p style="margin: 0 0 20px;">
            In the meantime, feel free to explore our website or follow us on social media to stay updated.
          </p>
          <p style="margin: 0 0 20px;">🙏 We appreciate your interest and support.</p>
          <p style="margin: 0;">— The Hussaini Welfare Association Team</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #F9FAFB; text-align: center; color: #6B7280; font-size: 14px;">
          You can reply to this email if you have more questions.
        </td>
      </tr>
    </table>
  </body>
</html>`);
};

export const ContactFormAdminNotification = (
  name: string,
  email: string,
  message: string
) => {
  return (`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>New Contact Form Submission</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #F3F4F6; color: #111827;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #FFFFFF; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <tr>
        <td style="padding: 20px; background-color: #1F2937; color: white; text-align: center; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">📥 New Message Received</h2>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <p style="margin: 0 0 20px;">You've received a new message via the contact form:</p>
          <p style="margin: 0 0 10px;"><strong>👤 Name:</strong> ${name}</p>
          <p style="margin: 0 0 10px;"><strong>📧 Email:</strong> ${email}</p>
          <p style="margin: 0 0 10px;"><strong>💬 Message:</strong></p>
          <blockquote style="margin: 10px 0; padding-left: 15px; border-left: 3px solid #10B981; color: #374151;">
            ${message}
          </blockquote>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #F9FAFB; text-align: center; color: #6B7280; font-size: 14px;">
          — Contact Form | Hussaini Welfare Association
        </td>
      </tr>
    </table>
  </body>
</html>`);
};

export const RoleChangeNotificationEmail = (
  userName: string,
  currentRole: string,
  updatedRole: string,
  reason: string,
  adminName: string,
  adminEmail: string
) => {
  return (`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Role Update Notification</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #F3F4F6; color: #111827;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #FFFFFF; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <tr>
        <td style="padding: 20px; background-color: #2563EB; color: white; text-align: center; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">🔔 Role Updated</h2>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <p style="margin: 0 0 20px;">Hi <strong>${userName}</strong>,</p>
          <p style="margin: 0 0 15px;">Your account role has been updated. Please find the details below:</p>

          <ul style="list-style: none; padding: 0; margin: 0 0 20px;">
            <li><strong>🧾 Previous Role:</strong> ${currentRole}</li>
            <li><strong>🚀 Updated Role:</strong> ${updatedRole}</li>
            <li><strong>📝 Reason:</strong> ${reason}</li>
          </ul>

          <p style="margin: 0 0 10px;">This change was made by:</p>
          <p style="margin: 0 0 5px;"><strong>👤 Name:</strong> ${adminName}</p>
          <p style="margin: 0 0 20px;"><strong>📧 Email:</strong> ${adminEmail}</p>

          <p style="margin: 0 0 0;">If you have any questions or concerns, feel free to reach out.</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #F9FAFB; text-align: center; color: #6B7280; font-size: 14px;">
          — User Management System | Hussaini Welfare Association
        </td>
      </tr>
    </table>
  </body>
</html>`);
};

export const RoleRequestAcceptedEmail = (
  userName: string,
  acceptedRole: string,
  note: string,
  adminName: string,
  adminEmail: string
) => {
  return (`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Role Request Approved</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #F3F4F6; color: #111827;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #FFFFFF; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <tr>
        <td style="padding: 20px; background-color: #10B981; color: white; text-align: center; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">✅ Role Request Approved</h2>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <p style="margin: 0 0 20px;">Hi <strong>${userName}</strong>,</p>
          <p style="margin: 0 0 15px;">Great news! Your request to change your role has been approved.</p>

          <ul style="list-style: none; padding: 0; margin: 0 0 20px;">
            <li><strong>🎉 New Role:</strong> ${acceptedRole}</li>
            ${note ? `<li><strong>📝 Note from Admin:</strong> ${note}</li>` : ''}
          </ul>

          <p style="margin: 0 0 10px;">Approved by:</p>
          <p style="margin: 0 0 5px;"><strong>👤 Name:</strong> ${adminName}</p>
          <p style="margin: 0 0 20px;"><strong>📧 Email:</strong> ${adminEmail}</p>

          <p style="margin: 0;">If you have any questions or need further help, feel free to get in touch.</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #F9FAFB; text-align: center; color: #6B7280; font-size: 14px;">
          — Role Management | Hussaini Welfare Association
        </td>
      </tr>
    </table>
  </body>
</html>`);
};

export const RoleRequestRejectedEmail = (
  userName: string,
  rejectedRole: string,
  note: string,
  adminName: string,
  adminEmail: string
) => {
  return (`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Role Request Rejected</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #F3F4F6; color: #111827;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #FFFFFF; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <tr>
        <td style="padding: 20px; background-color: #EF4444; color: white; text-align: center; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">❌ Role Request Rejected</h2>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <p style="margin: 0 0 20px;">Hi <strong>${userName}</strong>,</p>
          <p style="margin: 0 0 15px;">We’ve reviewed your request to be upgraded to the role <strong>${rejectedRole}</strong>, but unfortunately, it has been rejected at this time.</p>

          ${note ? `<p style="margin: 0 0 20px;"><strong>📝 Note from Admin:</strong> ${note}</p>` : ''}

          <p style="margin: 0 0 10px;">Reviewed by:</p>
          <p style="margin: 0 0 5px;"><strong>👤 Name:</strong> ${adminName}</p>
          <p style="margin: 0 0 20px;"><strong>📧 Email:</strong> ${adminEmail}</p>

          <p style="margin: 0;">You’re welcome to reach out for clarification or re-apply in the future. Thank you for being a part of the community.</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #F9FAFB; text-align: center; color: #6B7280; font-size: 14px;">
          — Role Management | Hussaini Welfare Association
        </td>
      </tr>
    </table>
  </body>
</html>`);
};

export const DonationConfirmationEmail = (
  donorName: string,
  donorEmail: string,
  amount: number,
  thankYouNote?: string
) => {
  return (`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Donation Confirmation</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #F3F4F6; color: #111827;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #FFFFFF; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <tr>
        <td style="padding: 20px; background-color: #10B981; color: white; text-align: center; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">✅ Donation Received</h2>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <p style="margin: 0 0 20px;">Dear <strong>${donorName}</strong>,</p>
          <p style="margin: 0 0 15px;">We are deeply grateful for your generous donation. Your support means a lot to us.</p>

          <table cellpadding="0" cellspacing="0" style="margin: 20px 0; width: 100%;">
            <tr>
              <td style="padding: 5px 0;"><strong>🙍‍♂️ Name:</strong></td>
              <td>${donorName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>📧 Email:</strong></td>
              <td>${donorEmail}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>💰 Amount:</strong></td>
              <td>${amount}</td>
            </tr>
          </table>

          ${thankYouNote ? `<p style="margin: 20px 0;"><strong>🙏 Message:</strong> ${thankYouNote}</p>` : ''}

          <p style="margin: 0;">Once again, thank you for your kindness and support.</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #F9FAFB; text-align: center; color: #6B7280; font-size: 14px;">
          — Hussaini Welfare Association
        </td>
      </tr>
    </table>
  </body>
</html>`);
};
