import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rajgaming042@gmail.com",
    pass: "mfcptruwesiclajb",
  },
});

export default function sendMail(to: string, sub: string, msg: string) {
  transporter.sendMail({
    to: to,
    subject: sub,
    html: msg,
  });
}
