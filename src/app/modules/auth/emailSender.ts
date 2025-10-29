import nodemailer from "nodemailer";
import config from "../../../config";

/**
 * 📧 emailSender Utility
 * -----------------------------------------------------
 * Sends HTML-based emails using Nodemailer via Gmail SMTP.
 * Commonly used for password reset links and notification emails.
 *
 * @param email - Recipient's email address
 * @param html - HTML content of the email body
 */
const emailSender = async (email: string, html: string) => {
  // 🧩 Create a transporter (email client configuration)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465 (SSL), `false` for others
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass, // Gmail App Password (not raw password)
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });

  // ✉️ Send the email
  const info = await transporter.sendMail({
    from: '"PH Health Care" <bodruddozaredoy@gmail.com>', // Sender info
    to: email, // Recipient
    subject: "Reset Password Link", // Email subject
    html, // HTML email body
  });
};

export default emailSender;
