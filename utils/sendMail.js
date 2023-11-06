import nodemailer from "nodemailer";

const sendEmailAccept = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: `${process.env.GOOGLE_CLIENT_EMAIL}`,
        pass: `${process.env.EMAIL_APP}`,
      },
    });

    await transporter.sendMail({
      from: "Your Company Name <your.email@gmail.com>",
      to: email,
      subject: subject,
      html: `
        <html>
          <body>
            <p>Dear Customer,</p>
            <p>We have received a request to reset your password. To ensure the security of your account, please follow the steps below:</p>
            <ol>
              <li>Click on the "Login" button.</li>
              <li>Enter your email address and the temporary password provided below.</li>
              <li>Reset your password to a new secure one.</li>
            </ol>
            <p><a href="${text}">Confirm Password Reset</a></p>
            <p>If you didn't initiate this request, please contact our support team.</p>
            <p>Thank you for choosing Your Company Name for your service.</p>
            <p>Sincerely, Your Company Name</p>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email not sent. Error:", error);
  }
};
const sendMail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: `${process.env.GOOGLE_CLIENT_EMAIL}`,
        pass: `${process.env.EMAIL_APP}`,
      },
    });

    await transporter.sendMail({
      from: "Your Company Name <your.email@gmail.com>",
      to: email,
      subject: subject,
      html: `
        <html>
          <body>
            <p>Dear Customer,</p>
            <p>We have received a request to reset your password. To ensure the security of your account, please follow the steps below:</p>
            <ol>
              <li>Click on the "Login" button.</li>
              <li>Enter your email address and the temporary password provided below.</li>
              <li>Reset your password to a new secure one.</li>
            </ol>
            <p>Your Temporary Password: <strong>${text}</strong></p>
            <p>If you didn't initiate this request, please contact our support team.</p>
            <p>Thank you for choosing Your Company Name for your service.</p>
            <p>Sincerely, Your Company Name</p>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email not sent. Error:", error);
  }
};

export { sendMail, sendEmailAccept };
