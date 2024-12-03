const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "tranquocbao1410@gmail.com",
    pass: `${process.env.GMAIL_PASS}`,
  },
});
const sendEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: '"Páo đời Páo đốm 👻" <tranquocbao1410@gmail.com>', // sender address
      to: "luongngocphuonguyen@gmail.com", // list of receivers
      subject: "Hello Mấy cưng", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });

    console.log(info);
  } catch (error) {
    console.log(error);
  }
};
module.exports = transporter;
