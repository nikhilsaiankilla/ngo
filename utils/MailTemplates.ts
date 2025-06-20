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


