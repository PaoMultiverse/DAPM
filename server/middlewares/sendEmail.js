const transporter = require("../configs/email.config");
const { Verification_Email_Template } = require("../configs/EmailTemplate");
const sendVerficationCode = async (email, verficationCode) => {
  try {
    const res = await transporter.sendMail({
      from: '"Xác thực Email" <tranquocbao1410@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Xác thực Email cho Hostel Community", // Subject line
      text: "Mã OTP của bạn là", // plain text body
      html: Verification_Email_Template(verficationCode),
    });

    console.log("send email success", res);
  } catch (error) {
    console.log(error);
  }
};
module.exports = sendVerficationCode;
