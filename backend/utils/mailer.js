const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    console.log('Using configured SMTP settings...');
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(port) || 587,
      secure: port == 465,
      auth: { user, pass }
    });
  } else {
    console.log('SMTP credentials not found. Creating a test Ethereal Mail account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log(`Ethereal account created: ${testAccount.user}`);
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (error) {
      console.error('Failed to create Ethereal mail transporter:', error.message);
      // Fallback dummy transporter to avoid server crash
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }

  return transporter;
};

// Send registration confirmation with embedded QR Code
const sendRegistrationEmail = async (toEmail, userName, eventName, eventDate, venue, qrCodeDataUrl, registrationId) => {
  try {
    const client = await getTransporter();
    
    // Extract base64 image data
    const base64Data = qrCodeDataUrl.split(',')[1] || qrCodeDataUrl;
    const qrBuffer = Buffer.from(base64Data, 'base64');

    const mailOptions = {
      from: `"EventFlow" <${process.env.SMTP_USER || 'no-reply@eventflow.com'}>`,
      to: toEmail,
      subject: `Registration Confirmed: ${eventName}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px;">
            <h2 style="color: #4f46e5; margin: 0; font-size: 26px;">Registration Confirmed!</h2>
            <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">Hi ${userName}, you are successfully registered for the event.</p>
          </div>
          
          <div style="padding: 20px 0; border-bottom: 1px solid #f3f4f6;">
            <h3 style="color: #1f2937; margin-top: 0;">Event Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #4b5563; font-weight: bold; width: 120px;">Event Name:</td>
                <td style="padding: 6px 0; color: #111827;">${eventName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #4b5563; font-weight: bold;">Date:</td>
                <td style="padding: 6px 0; color: #111827;">${new Date(eventDate).toDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #4b5563; font-weight: bold;">Venue:</td>
                <td style="padding: 6px 0; color: #111827;">${venue}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #4b5563; font-weight: bold;">Ticket ID:</td>
                <td style="padding: 6px 0; color: #4b5563; font-family: monospace; font-size: 14px;">${registrationId}</td>
              </tr>
            </table>
          </div>

          <div style="padding: 25px 0; text-align: center; background-color: #f8fafc; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 15px;">Your Entry Ticket QR Code</h3>
            <img src="cid:qrcode" alt="QR Code Ticket" style="width: 200px; height: 200px; display: inline-block; border: 4px solid #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
            <p style="color: #ef4444; font-size: 13px; font-weight: bold; margin-top: 15px; margin-bottom: 0;">Please present this QR code at the entrance for verification.</p>
          </div>

          <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
            <p>Sent via EventFlow Event Registration & Management System.</p>
            <p>&copy; ${new Date().getFullYear()} EventFlow. All rights reserved.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `ticket-${registrationId}.png`,
          content: qrBuffer,
          cid: 'qrcode'
        }
      ]
    };

    const info = await client.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    
    // Log Ethereal preview link if using Ethereal
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`[Ethereal Email Preview URL]: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } catch (error) {
    console.error('Error sending registration email:', error.message);
    throw error;
  }
};

// Send Certificate email with PDF attachment
const sendCertificateEmail = async (toEmail, userName, eventName, certificatePdfBuffer) => {
  try {
    const client = await getTransporter();

    const mailOptions = {
      from: `"EventFlow" <${process.env.SMTP_USER || 'no-reply@eventflow.com'}>`,
      to: toEmail,
      subject: `Your Certificate of Participation: ${eventName}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px;">
            <h2 style="color: #10b981; margin: 0; font-size: 26px;">Congratulations!</h2>
            <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">Hi ${userName}, here is your Certificate of Participation.</p>
          </div>
          
          <div style="padding: 20px 0; text-align: center;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for attending <strong>${eventName}</strong>. We appreciate your active participation and hope it was a valuable learning experience.
            </p>
            <p style="color: #4b5563; font-size: 15px; margin-top: 15px;">
              Your official Certificate of Participation is attached to this email as a PDF document.
            </p>
          </div>

          <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
            <p>Sent via EventFlow Event Registration & Management System.</p>
            <p>&copy; ${new Date().getFullYear()} EventFlow. All rights reserved.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Certificate_${eventName.replace(/\s+/g, '_')}.pdf`,
          content: certificatePdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await client.sendMail(mailOptions);
    console.log(`Certificate email sent successfully: ${info.messageId}`);
    
    // Log Ethereal preview link if using Ethereal
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`[Ethereal Certificate Email Preview URL]: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } catch (error) {
    console.error('Error sending certificate email:', error.message);
    throw error;
  }
};

module.exports = {
  sendRegistrationEmail,
  sendCertificateEmail
};
