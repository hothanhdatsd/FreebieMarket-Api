import nodemailer from "nodemailer";
const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: `${process.env.GOOGLE_CLIENT_EMAIL}`,
        pass: `${process.env.EMAIL_APP}`,
      },
    });

    await transporter.sendMail({
      from: "ServiceFreebieMarket",
      to: email,
      subject: subject,
      text: text,
    });

    console.log("email sent sucessfully");
  } catch (error) {
    console.log(error, "email not sent");
  }
};
export default sendEmail;
