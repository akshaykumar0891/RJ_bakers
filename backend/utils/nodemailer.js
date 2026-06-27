const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter;

// Set up transporter async or sync
const getTransporter = async () => {
  if (transporter) return transporter;

  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    console.log('📧 Nodemailer configured with Custom SMTP Server.');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    console.log('📧 SMTP credentials not found in .env. Creating test email account using Ethereal...');
    try {
      // Create a test account on Ethereal.email
      const testAccount = await nodemailer.createTestAccount();
      console.log(`✉️ Ethereal Email test account created! User: ${testAccount.user}`);
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (error) {
      console.error('❌ Failed to create Ethereal SMTP transporter, falling back to mock transporter:', error.message);
      // Fallback mock transporter that does nothing
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('✉️ [Mock Email Sent]:', mailOptions.subject);
          return { messageId: 'mock-id-' + Date.now() };
        }
      };
    }
  }

  return transporter;
};

// Helper to send order status notifications
const sendNotification = async ({ to, subject, html }) => {
  try {
    const client = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || 'noreply@rjbakers.com';
    const info = await client.sendMail({
      from: `"RJ Bakers" <${fromAddress}>`,
      to,
      subject,
      html
    });

    console.log(`📬 Notification email sent: "${subject}" to ${to}`);
    // If using Ethereal, log the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Preview Sent Email at: ${previewUrl}`);
    }
    return info;
  } catch (error) {
    console.error('❌ Error sending email notification:', error.message);
    return null;
  }
};

module.exports = {
  sendNotification
};
